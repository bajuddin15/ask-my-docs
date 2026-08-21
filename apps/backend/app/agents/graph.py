"""
Wires the 4 agents into a single LangGraph StateGraph.

    START -> router -> retriever -> answer -> critic --[grounded/exhausted]--> END
                            ^                     |
                            |___[not grounded, retries left]___|

Built as a factory (build_graph) rather than a module-level singleton
because the retriever node needs a request-scoped DB session — each
request gets its own compiled graph instance, which is cheap since
compilation is just wiring, not any network/DB work itself.
"""
from langgraph.graph import END, START, StateGraph
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.nodes.answer_agent import answer_node
from app.agents.nodes.critic_agent import critic_node, route_after_critic
from app.agents.nodes.retriever_agent import make_retriever_node
from app.agents.nodes.router_agent import router_node
from app.agents.state import AgentState


def build_graph(db: AsyncSession):
    graph = StateGraph(AgentState)

    graph.add_node("router", router_node)
    graph.add_node("retriever", make_retriever_node(db))
    graph.add_node("answer", answer_node)
    graph.add_node("critic", critic_node)

    graph.add_edge(START, "router")
    graph.add_edge("router", "retriever")
    graph.add_edge("retriever", "answer")
    graph.add_edge("answer", "critic")
    graph.add_conditional_edges("critic", route_after_critic, {"retry": "retriever", "end": END})

    return graph.compile()

async def run_agent(
    db: AsyncSession, workspace_id: str, question: str,
    critic_enabled: bool = True, max_retries: int = 2,
) -> AgentState:
    graph = build_graph(db)
    initial_state: AgentState = {
        "workspace_id": workspace_id, "question": question,
        "critic_enabled": critic_enabled, "max_retries": max_retries,
        "intent": "general", "retrieved_chunks": [], "draft_answer": "",
        "is_grounded": False, "critic_feedback": "", "retry_count": 0,
        "next_action": "retry", "final_answer": "", "sources": [],
    }
    config = {
        "run_name": "ask_my_docs_agent",
        "tags": ["multi-agent-rag", f"workspace:{workspace_id}"],
        "metadata": {"workspace_id": workspace_id, "question": question},
    }
    return await graph.ainvoke(initial_state, config=config)