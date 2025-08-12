import { NextRequest } from 'next/server';
import { createSearchPlan, executeSearchPlan } from '../../../lib/aiSearch';
import { getSandboxState } from '../../../lib/sandboxState';
import { sendProgress } from '../../../lib/progress';

export async function POST(req: NextRequest) {
  try {
    const sandboxState = getSandboxState();

    await sendProgress({ type: 'status', message: '🔍 Creating search plan...' });

    // Bezpieczny odczyt, aby uniknąć błędu "possibly null"
    const fileContents = sandboxState?.fileCache?.files ?? {};
    console.log(
      '[generate-ai-code-stream] Files available for search:',
      Object.keys(fileContents).length
    );

    // STEP 1: Get search plan from AI
    const plan = await createSearchPlan(fileContents);

    await sendProgress({ type: 'status', message: '📂 Executing search plan...' });

    // STEP 2: Execute plan
    const results = await executeSearchPlan(plan, fileContents);

    await sendProgress({ type: 'done', message: '✅ Search completed!' });

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[generate-ai-code-stream] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
