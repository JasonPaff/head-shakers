import * as fs from 'fs';

interface ToolInput {
  command?: string;
  description?: string;
}

interface InputData {
  tool_input?: ToolInput;
}

let input = '';

process.stdin.on('data', (chunk: Buffer) => (input += chunk.toString()));
process.stdin.on('end', () => {
  try {
    const data: InputData = JSON.parse(input);
    const command: string = data.tool_input?.command || 'Unknown command';
    const description: string = data.tool_input?.description || 'No description';

    const logEntry: string = `${new Date().toISOString()}: ${command} - ${description}\n`;
    fs.appendFileSync('./.claude/logs/pre-tool-use-log.txt', logEntry);

    console.log(`Logged: ${command}`);
  } catch (error) {
    console.error('Error logging command:', (error as Error).message);
  }
});
