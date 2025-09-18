#!/usr/bin/env python3
"""
Orchestration Progress Tracker and Error Recovery
Tracks orchestration execution metrics and provides recovery suggestions.
"""
import json
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
import re

class OrchestrationTracker:
    def __init__(self):
        self.log_dir = Path('.claude/logs')
        self.log_dir.mkdir(exist_ok=True)
        self.metrics_file = self.log_dir / 'orchestration_metrics.json'
        self.session_file = self.log_dir / 'current_orchestration.json'

    def load_metrics(self):
        """Load historical orchestration metrics."""
        if self.metrics_file.exists():
            try:
                with open(self.metrics_file, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {
            'total_orchestrations': 0,
            'successful_orchestrations': 0,
            'failed_orchestrations': 0,
            'average_duration': 0,
            'agent_compliance_rates': {
                'implementation-planner': {'total': 0, 'compliant': 0},
                'file-discovery-agent': {'total': 0, 'compliant': 0},
                'general-purpose': {'total': 0, 'compliant': 0}
            },
            'common_failure_patterns': [],
            'last_updated': None
        }

    def save_metrics(self, metrics):
        """Save metrics to persistent storage."""
        metrics['last_updated'] = datetime.now().isoformat()
        with open(self.metrics_file, 'w') as f:
            json.dump(metrics, f, indent=2)

    def track_orchestration_start(self, feature_name):
        """Track the start of an orchestration."""
        session_data = {
            'feature_name': feature_name,
            'start_time': datetime.now().isoformat(),
            'steps_completed': [],
            'violations_found': [],
            'status': 'in_progress'
        }

        with open(self.session_file, 'w') as f:
            json.dump(session_data, f, indent=2)

        print(f"📊 Tracking orchestration: {feature_name}")

    def track_agent_execution(self, agent_type, compliance_violations):
        """Track agent execution and compliance."""
        if not self.session_file.exists():
            return

        with open(self.session_file, 'r') as f:
            session_data = json.load(f)

        # Record agent execution
        step_data = {
            'agent_type': agent_type,
            'timestamp': datetime.now().isoformat(),
            'violations': compliance_violations,
            'compliant': len(compliance_violations) == 0
        }

        session_data['steps_completed'].append(step_data)
        session_data['violations_found'].extend(compliance_violations)

        with open(self.session_file, 'w') as f:
            json.dump(session_data, f, indent=2)

        # Update historical metrics
        metrics = self.load_metrics()
        agent_stats = metrics['agent_compliance_rates'].get(agent_type, {'total': 0, 'compliant': 0})
        agent_stats['total'] += 1
        if len(compliance_violations) == 0:
            agent_stats['compliant'] += 1
        metrics['agent_compliance_rates'][agent_type] = agent_stats

        self.save_metrics(metrics)

    def track_orchestration_complete(self, success=True):
        """Track orchestration completion and calculate metrics."""
        if not self.session_file.exists():
            return

        with open(self.session_file, 'r') as f:
            session_data = json.load(f)

        start_time = datetime.fromisoformat(session_data['start_time'])
        duration = (datetime.now() - start_time).total_seconds()

        session_data['end_time'] = datetime.now().isoformat()
        session_data['duration_seconds'] = duration
        session_data['status'] = 'completed' if success else 'failed'

        # Update historical metrics
        metrics = self.load_metrics()
        metrics['total_orchestrations'] += 1

        if success:
            metrics['successful_orchestrations'] += 1
        else:
            metrics['failed_orchestrations'] += 1

        # Update average duration
        total_completed = metrics['successful_orchestrations'] + metrics['failed_orchestrations']
        if total_completed > 1:
            old_avg = metrics['average_duration']
            metrics['average_duration'] = (old_avg * (total_completed - 1) + duration) / total_completed
        else:
            metrics['average_duration'] = duration

        self.save_metrics(metrics)

        # Archive session
        archive_file = self.log_dir / f"orchestration_{session_data['feature_name']}_{start_time.strftime('%Y%m%d_%H%M%S')}.json"
        with open(archive_file, 'w') as f:
            json.dump(session_data, f, indent=2)

        # Clean up current session
        self.session_file.unlink()

        self.print_completion_summary(session_data, metrics)

    def print_completion_summary(self, session_data, metrics):
        """Print orchestration completion summary with recommendations."""
        success = session_data['status'] == 'completed'
        duration = session_data.get('duration_seconds', 0)

        print(f"\n{'✅' if success else '❌'} ORCHESTRATION {'COMPLETED' if success else 'FAILED'}")
        print(f"📊 Duration: {duration:.1f} seconds")
        print(f"🎯 Feature: {session_data['feature_name']}")

        # Compliance summary
        total_violations = len(session_data.get('violations_found', []))
        print(f"⚠️  Violations: {total_violations}")

        if total_violations > 0:
            print("\n🔧 RECOMMENDATIONS:")
            violations = session_data.get('violations_found', [])

            # Categorize violations
            format_violations = [v for v in violations if 'XML format' in v or 'markdown template' in v]
            code_violations = [v for v in violations if 'code examples' in v]
            validation_violations = [v for v in violations if 'validation commands' in v]

            if format_violations:
                print("  📝 Update implementation-planner agent prompt to enforce markdown format")
            if code_violations:
                print("  🚫 Strengthen code example prohibition in agent prompts")
            if validation_violations:
                print("  ✅ Add validation command templates to agent memory")

        # Historical performance
        success_rate = (metrics['successful_orchestrations'] / max(metrics['total_orchestrations'], 1)) * 100
        print(f"\n📈 HISTORICAL PERFORMANCE:")
        print(f"  Success Rate: {success_rate:.1f}% ({metrics['successful_orchestrations']}/{metrics['total_orchestrations']})")
        print(f"  Average Duration: {metrics['average_duration']:.1f}s")

        # Agent compliance rates
        print(f"\n🤖 AGENT COMPLIANCE:")
        for agent, stats in metrics['agent_compliance_rates'].items():
            if stats['total'] > 0:
                compliance_rate = (stats['compliant'] / stats['total']) * 100
                print(f"  {agent}: {compliance_rate:.1f}% ({stats['compliant']}/{stats['total']})")

def main():
    try:
        input_data = json.load(sys.stdin)
        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})

        tracker = OrchestrationTracker()

        # Track different events
        if tool_name == 'Task':
            # Agent execution
            agent_type = tool_input.get('subagent_type', '')

            # Check for violations in the session log
            violations = []
            if Path('.claude/logs/agent_violations.log').exists():
                # Read recent violations for this agent
                with open('.claude/logs/agent_violations.log', 'r') as f:
                    log_content = f.read()

                # Extract violations for this agent type from recent entries
                recent_violations = re.findall(rf'\[{agent_type}\] Violations found:(.*?)(?=\n\[|\n$)', log_content, re.DOTALL)
                if recent_violations:
                    violation_lines = recent_violations[-1].strip().split('\n')
                    violations = [line.strip('- ').strip() for line in violation_lines if line.strip().startswith('-')]

            tracker.track_agent_execution(agent_type, violations)

        elif tool_name == 'Bash':
            command = tool_input.get('command', '')

            # Detect orchestration start
            if 'plan-feature' in command and '"' in command:
                # Extract feature name from command
                feature_match = re.search(r'plan-feature\s+"([^"]+)"', command)
                if feature_match:
                    feature_name = feature_match.group(1).lower().replace(' ', '-')
                    tracker.track_orchestration_start(feature_name)

            # Detect orchestration completion patterns
            elif any(pattern in command for pattern in ['docs/', 'orchestration', 'implementation-plan']):
                # Check if this appears to be end of orchestration
                tool_result = input_data.get('tool_result', {})
                if 'Implementation Plan Generated' in str(tool_result) or 'Orchestration Logs' in str(tool_result):
                    tracker.track_orchestration_complete(success=True)

    except Exception as e:
        print(f"❌ Progress tracking error: {e}", file=sys.stderr)

if __name__ == '__main__':
    main()