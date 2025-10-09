import * as fs from 'fs';

interface ToolInput {
  // bash-specific
  command?: string;
  description?: string;

  // file operation tools
  file_path?: string;
  pattern?: string;

  // edit tool
  old_string?: string;
  new_string?: string;

  // grep tool
  output_mode?: string;

  // web tools
  url?: string;
  query?: string;

  // task tool
  prompt?: string;
  subagent_type?: string;

  // other fields
  [key: string]: unknown;
}

interface InputData {
  tool_name?: string;
  tool_input?: ToolInput;
}

let input = '';

process.stdin.on('data', (chunk: Buffer) => (input += chunk.toString()));
process.stdin.on('end', () => {
  try {
    const data: InputData = JSON.parse(input);
    const toolName = data.tool_name || 'Unknown tool';
    const toolInput = data.tool_input || {};

    let logMessage: string;

    switch (toolName) {
      case 'Bash':
        logMessage = `${toolName}: ${toolInput.command || 'no command'} - ${toolInput.description || 'No description'}`;
        break;

      case 'Read':
      case 'Write':
      case 'Edit':
        logMessage = `${toolName}: ${toolInput.file_path || 'unknown file'}`;
        break;

      case 'Glob':
      case 'Grep':
        logMessage = `${toolName}: ${toolInput.pattern || 'no pattern'} ${toolInput.file_path ? `in ${toolInput.file_path}` : ''}`;
        break;

      case 'WebFetch':
      case 'WebSearch':
        logMessage = `${toolName}: ${toolInput.url || toolInput.query || 'no target'}`;
        break;

      case 'Task':
        logMessage = `${toolName} (${toolInput.subagent_type || 'unknown'}): ${(toolInput.prompt || '').slice(0, 60)}${(toolInput.prompt?.length || 0) > 60 ? '...' : ''}`;
        break;

      case 'TodoWrite':
        logMessage = `${toolName}: updating todo list`;
        break;

      case 'SlashCommand':
        logMessage = `${toolName}: ${JSON.stringify(toolInput).slice(0, 100)}`;
        break;

      default:
        // for any other tools, show the tool name and first key-value pair
        const firstKey = Object.keys(toolInput)[0];
        const firstValue = firstKey ? toolInput[firstKey] : 'no params';
        logMessage = `${toolName}: ${firstKey || 'unknown'} = ${typeof firstValue === 'string' ? firstValue.slice(0, 50) : JSON.stringify(firstValue)?.slice(0, 50) || ''}`;
    }

    const logEntry = `${new Date().toISOString()}: ${logMessage}\n`;
    fs.appendFileSync('./.claude/logs/pre-tool-use-log.txt', logEntry);

    console.log(`Logged: ${toolName}`);
  } catch (error) {
    console.error('Error logging command:', (error as Error).message);
  }
});
