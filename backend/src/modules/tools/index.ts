import { toolRegistry } from './tool.registry.js';
import { WebSearchTool } from './implementations/web_search.tool.js';
import { CalculatorTool } from './implementations/calculator.tool.js';
import { DateTimeTool } from './implementations/datetime.tool.js';
import { TextUtilitiesTool } from './implementations/text_utilities.tool.js';
import { CodeExecutionTool } from './implementations/code_execution.tool.js';

export function initializeTools(): void {
  toolRegistry.registerTool(new WebSearchTool());
  toolRegistry.registerTool(new CalculatorTool());
  toolRegistry.registerTool(new DateTimeTool());
  toolRegistry.registerTool(new TextUtilitiesTool());
  toolRegistry.registerTool(new CodeExecutionTool());

  console.log(`🛠️ Registered ${toolRegistry.getAllTools().length} AI Agent Tools`);
}

export * from './tool.interface.js';
export * from './tool.registry.js';
