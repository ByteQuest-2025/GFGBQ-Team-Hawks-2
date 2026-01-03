import { CopilotModule } from '../components/dashboard/CopilotModule';
import { MCPToolsPanel } from '../components/dashboard/MCPToolsPanel';

export function Copilot() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Main Chat Area */}
            <div className="lg:col-span-2 h-full">
                <CopilotModule />
            </div>

            {/* Tools Sidebar */}
            <div className="lg:col-span-1 space-y-6 overflow-y-auto">
                <MCPToolsPanel />
            </div>
        </div>
    );
}
