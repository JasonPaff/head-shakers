import * as fs from 'fs';

interface InputData {
  tool_name?: string;
  tool_input?: Record<string, unknown>;
}

let input = '';

process.stdin.on('data', (chunk: Buffer) => (input += chunk.toString()));
process.stdin.on('end', () => {
  try {
    const data: InputData = JSON.parse(input);
    const toolName: string = data.tool_name || 'Unknown tool';
    const toolInput = data.tool_input || {};

    // Format the log entry with tool name and all input parameters
    const timestamp = new Date().toISOString();
    const inputSummary = JSON.stringify(toolInput, null, 2);
    const logEntry = `\n${'='.repeat(80)}\n${timestamp}\nTool: ${toolName}\nInput:\n${inputSummary}\n${'='.repeat(80)}\n`;

    fs.appendFileSync('./docs/pre-tool-use-log.txt', logEntry);

    console.log(`Logged: ${toolName}`);
  } catch (error) {
    console.error('Error logging command:', (error as Error).message);
  }
});
