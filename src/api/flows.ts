export async function publishFlow(flowId: string, publish: boolean): Promise<{ ok: true; published: boolean }> {
  await new Promise((res) => setTimeout(res, 300));
  console.info('[api] publish', { flowId, publish });
  return { ok: true, published: publish };
}
