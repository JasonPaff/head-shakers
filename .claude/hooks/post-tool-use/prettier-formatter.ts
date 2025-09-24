import { execSync } from 'child_process';

interface ToolData {
  tool_input?: {
    file_path?: string;
  };
}

const input: string = process.argv[2] || '';

try {
  const data: ToolData = JSON.parse(input);
  const filePath = data.tool_input?.file_path;

  if (filePath && /\.(js|jsx|ts|tsx)$/.test(filePath)) {
    execSync(`npx prettier --write "${filePath}"`, { stdio: 'inherit' });
  }
} catch (error) {
  // Silently ignore parsing errors
}
