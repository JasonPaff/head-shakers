# Feature Planner - User Requirements Gap Analysis

**Date:** 2025-10-09
**Purpose:** Identify gaps between user requirements and current architecture/schema design
**Status:** ⚠️ Significant Gaps Identified - Schema & Architecture Updates Required

## Executive Summary

After analyzing the user's detailed feature requirements against the existing architecture documentation, I've identified **8 critical gaps** that require immediate attention before implementation begins. These gaps span database schema design, API architecture, and UI components.

### Impact Assessment

| Category             | Gaps Identified | Impact Level | Implementation Effort |
| -------------------- | --------------- | ------------ | --------------------- |
| **Database Schema**  | 8 major gaps    | 🔴 High      | 2-3 days              |
| **API Architecture** | 6 major gaps    | 🟡 Medium    | 3-4 days              |
| **UI Components**    | 7 major gaps    | 🟡 Medium    | 4-5 days              |
| **Service Layer**    | 5 major gaps    | 🟡 Medium    | 2-3 days              |

**Recommendation:** Update schema and architecture before starting implementation.

---

## Gap Analysis by Feature

### 1. Feature Request Refinement

#### ✅ What's Covered

- Basic refinement agent invocation
- Parallel refinement execution (Phase 2)
- User selection of best refinement
- Real-time streaming (Phase 3)

#### ❌ Critical Gaps

##### Gap 1.1: Customizable Output Length

**User Requirement:**

> "As a user I would like to be able to customize the minimum & maximum output length"

**Current State:**

- Schema has `refinementSettings` JSONB but doesn't specify these fields
- No UI controls for length customization
- Agent prompt hardcoded to "150-300 words"

**Required Changes:**

**Database Schema:**

```typescript
// Update RefinementSettings interface
export interface RefinementSettings {
  agentCount: number;
  includeProjectContext: boolean;
  minOutputLength: number; // NEW
  maxOutputLength: number; // NEW
  parallelExecution?: boolean;
  customModel?: string;
}
```

**UI Component:**

```typescript
// refinement-settings.tsx - Add controls
<div>
  <Label>Minimum Output Length (words)</Label>
  <Input
    type="number"
    value={settings.minOutputLength}
    onChange={(e) => updateSettings({ minOutputLength: parseInt(e.target.value) })}
    min={50}
    max={1000}
  />
</div>

<div>
  <Label>Maximum Output Length (words)</Label>
  <Input
    type="number"
    value={settings.maxOutputLength}
    onChange={(e) => updateSettings({ maxOutputLength: parseInt(e.target.value) })}
    min={100}
    max={2000}
  />
</div>
```

**Service Layer:**

```typescript
// Pass settings to agent prompt
const prompt = `Refine this feature request: ${originalRequest}

REQUIREMENTS:
- Output length: ${settings.minOutputLength}-${settings.maxOutputLength} words
- Single paragraph only
- Include technical context`;
```

##### Gap 1.2: Optional Project Context

**User Requirement:**

> "As a user I would like to be able to optionally include project context in the refinement"

**Current State:**

- Project context (CLAUDE.md, package.json) always read by agent
- No toggle to disable

**Required Changes:**

**Database Schema:**

```typescript
// Already has this field in RefinementSettings - just needs implementation
includeProjectContext: boolean; // ✅ Already defined
```

**UI Component:**

```typescript
// refinement-settings.tsx - Add toggle
<div className="flex items-center space-x-2">
  <Switch
    checked={settings.includeProjectContext}
    onCheckedChange={(checked) =>
      updateSettings({ includeProjectContext: checked })
    }
  />
  <Label>Include Project Context (CLAUDE.md, package.json)</Label>
</div>
```

**Service Layer:**

```typescript
// Conditionally allow file reading
const allowedTools =
  settings.includeProjectContext ?
    ['Read', 'Grep', 'Glob'] // Can read project files
  : []; // No file access
```

---

### 2. File Discovery

#### ✅ What's Covered

- AI-powered file discovery
- Priority categorization (high/medium/low)
- User selection of files
- Real-time streaming (Phase 3)

#### ❌ Critical Gaps

##### Gap 2.1: Critical Priority Level

**User Requirement:**

> "organized by critical, high priority, medium priority, low priority"

**Current State:**

```typescript
// Only has 3 levels, missing "critical"
export const filePriorityEnum = pgEnum('file_priority', ['high', 'medium', 'low']);
```

**Required Changes:**

**Database Schema:**

```typescript
// Add "critical" priority level
export const filePriorityEnum = pgEnum('file_priority', [
  'critical', // NEW - Must modify
  'high',
  'medium',
  'low',
]);
```

**TypeScript Types:**

```typescript
export interface FileDiscoveryResult {
  filePath: string;
  priority: 'critical' | 'high' | 'medium' | 'low'; // Updated
  relevanceScore: number;
  description: string;
  reasoning?: string;
  fileExists?: boolean;
}
```

**UI Component:**

```typescript
// step-2-discovery.tsx - Add critical section
const priorityGroups = {
  critical: files.filter((f) => f.priority === 'critical'),
  high: files.filter((f) => f.priority === 'high'),
  medium: files.filter((f) => f.priority === 'medium'),
  low: files.filter((f) => f.priority === 'low'),
};
```

##### Gap 2.2: Enhanced File Metadata

**User Requirement:**

> "see the role, relevance, integration point, and AI reasoning for each file"

**Current State:**

```typescript
// Only has description and reasoning
{
  description: text('description'),
  reasoning: text('reasoning'),
}
```

**Required Changes:**

**Database Schema:**

```typescript
export const discoveredFiles = pgTable('discovered_files', {
  // ... existing fields ...

  description: text('description'),
  reasoning: text('reasoning'),

  // NEW FIELDS
  role: varchar('role', { length: 100 }), // e.g., "React Component", "API Route"
  integrationPoint: text('integration_point'), // e.g., "User authentication flow"

  // ... rest of fields ...
});
```

**TypeScript Types:**

```typescript
export interface FileDiscoveryResult {
  filePath: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  relevanceScore: number;
  description: string;
  reasoning?: string;
  role?: string; // NEW
  integrationPoint?: string; // NEW
  fileExists?: boolean;
}
```

**Agent Prompt Update:**

```typescript
// Update file-discovery-agent to include role and integration point
const prompt = `Find relevant files for this feature request.

For each file, provide:
- File path
- Priority (critical/high/medium/low)
- Role (what type of file: component, service, schema, etc.)
- Integration point (how it connects to the feature)
- Reasoning (why it's relevant)`;
```

##### Gap 2.3: Manual File Addition

**User Requirement:**

> "As a user I would like to be able to manually add files to the list (should autocomplete on project/git files)"

**Current State:**

- No mechanism to manually add files
- No autocomplete component
- No API to list project files

**Required Changes:**

**Database Schema:**

```typescript
export const discoveredFiles = pgTable('discovered_files', {
  // ... existing fields ...

  // NEW FIELD to track source
  isManuallyAdded: boolean('is_manually_added').default(false).notNull(),
  addedByUserId: uuid('added_by_user_id').references(() => users.id),

  // ... rest of fields ...
});
```

**API Route (NEW):**

```typescript
// /app/api/feature-planner/files/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  // Use git ls-files to get tracked files
  const { stdout } = await execAsync('git ls-files');
  const files = stdout
    .split('\n')
    .filter((f) => f.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 20); // Limit results

  return NextResponse.json({ files });
}
```

**UI Component (NEW):**

```typescript
// components/file-autocomplete.tsx
import { Combobox } from '@/components/ui/combobox';

export function FileAutocomplete({ onSelect }: { onSelect: (file: string) => void }) {
  const [query, setQuery] = useState('');
  const { data: files } = useQuery({
    queryKey: ['files', query],
    queryFn: () => fetch(`/api/feature-planner/files/search?q=${query}`).then(r => r.json()),
    enabled: query.length > 2
  });

  return (
    <Combobox
      value={query}
      onValueChange={setQuery}
      items={files?.files || []}
      onSelect={onSelect}
      placeholder="Search project files..."
    />
  );
}
```

##### Gap 2.4: Parallel File Discovery

**User Requirement:**

> "As a user I would like to be able to use a single agent or multiple agents in parallel to do file discovery"

**Current State:**

- Only single file discovery session per plan
- No parallel execution support
- No comparison/selection mechanism

**Required Changes:**

**Database Schema:**

```typescript
// Add agent tracking and selection to file_discovery_sessions
export const fileDiscoverySessions = pgTable('file_discovery_sessions', {
  // ... existing fields ...

  // NEW FIELDS for parallel support
  agentId: varchar('agent_id', { length: 100 }).notNull(), // e.g., 'agent-1', 'agent-2'
  isSelected: boolean('is_selected').default(false), // Which discovery was chosen

  // ... rest of fields ...
});

// Add FK to plan to track selected session
export const featurePlans = pgTable('feature_plans', {
  // ... existing fields ...

  selectedDiscoverySessionId: uuid('selected_discovery_session_id').references(
    () => fileDiscoverySessions.id,
  ),

  // ... rest of fields ...
});
```

**Service Layer:**

```typescript
// feature-planner.service.ts
async runParallelFileDiscovery(
  planId: string,
  refinedRequest: string,
  agentCount: number = 1
) {
  const discoveryPromises = Array.from(
    { length: agentCount },
    (_, i) => this.runSingleFileDiscovery(
      planId,
      refinedRequest,
      `discovery-agent-${i + 1}`
    )
  );

  const sessions = await Promise.all(discoveryPromises);
  return sessions;
}
```

**UI Component:**

```typescript
// step-2-discovery.tsx - Tabbed view for multiple discoveries
<Tabs defaultValue="agent-1">
  {discoverySessions.map(session => (
    <TabsContent key={session.id} value={session.agentId}>
      <FileDiscoveryResults
        files={session.files}
        onSelect={() => selectDiscoverySession(session.id)}
      />
    </TabsContent>
  ))}
</Tabs>
```

---

### 3. Implementation Planner

#### ✅ What's Covered

- AI-powered plan generation
- Save plans to database
- Load existing plans (via versioning)
- Real-time streaming (Phase 3)

#### ❌ Critical Gaps

##### Gap 3.1: Plan Step Structure & Editing

**User Requirement:**

> "As a user I would like to be able to edit any part of the implementation plan"

**Current State:**

- Implementation plan stored as single text blob
- No structured step-by-step format
- No editing capability

**Required Changes:**

**Database Schema (NEW TABLE):**

```typescript
export const planSteps = pgTable(
  'plan_steps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    planGenerationId: uuid('plan_generation_id')
      .references(() => implementationPlanGenerations.id, { onDelete: 'cascade' })
      .notNull(),

    // Step details
    stepNumber: integer('step_number').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),

    // Execution details
    commands: jsonb('commands').$type<string[]>(), // e.g., ["npm run lint:fix", "npm run typecheck"]
    validationCommands: jsonb('validation_commands').$type<string[]>(),

    // Metadata
    category: varchar('category', { length: 50 }), // e.g., "setup", "implementation", "testing"
    estimatedDuration: varchar('estimated_duration', { length: 50 }),
    confidenceLevel: varchar('confidence_level', { length: 20 }), // e.g., "high", "medium", "low"

    // For reordering
    displayOrder: integer('display_order').notNull(),

    // Template tracking
    templateId: uuid('template_id').references(() => planStepTemplates.id),
    isFromTemplate: boolean('is_from_template').default(false),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('plan_steps_generation_id_idx').on(table.planGenerationId),
    index('plan_steps_display_order_idx').on(table.displayOrder),
    index('plan_steps_template_id_idx').on(table.templateId),
  ],
);
```

**API Routes (NEW):**

```typescript
// /app/api/feature-planner/plan/[planId]/steps/route.ts

// GET - List all steps
export async function GET(req: Request, { params }: { params: { planId: string } }) {
  const steps = await db.query.planSteps.findMany({
    where: eq(planSteps.planGenerationId, params.planId),
    orderBy: asc(planSteps.displayOrder),
  });

  return NextResponse.json({ steps });
}

// POST - Create new step
export async function POST(req: Request, { params }: { params: { planId: string } }) {
  const stepData = await req.json();

  const [step] = await db
    .insert(planSteps)
    .values({
      planGenerationId: params.planId,
      ...stepData,
    })
    .returning();

  return NextResponse.json({ step });
}

// PUT - Update step
export async function PUT(req: Request) {
  const { stepId, updates } = await req.json();

  const [step] = await db
    .update(planSteps)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(planSteps.id, stepId))
    .returning();

  return NextResponse.json({ step });
}

// PATCH - Reorder steps
export async function PATCH(req: Request, { params }: { params: { planId: string } }) {
  const { stepOrders } = await req.json(); // [{ stepId: '...', displayOrder: 1 }, ...]

  // Batch update display orders
  await Promise.all(
    stepOrders.map(({ stepId, displayOrder }) =>
      db.update(planSteps).set({ displayOrder }).where(eq(planSteps.id, stepId)),
    ),
  );

  return NextResponse.json({ success: true });
}
```

**UI Component:**

```typescript
// components/plan-step-editor.tsx
export function PlanStepEditor({ step, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStep, setEditedStep] = useState(step);

  const handleSave = async () => {
    await fetch(`/api/feature-planner/plan/steps`, {
      method: 'PUT',
      body: JSON.stringify({ stepId: step.id, updates: editedStep })
    });
    onUpdate(editedStep);
    setIsEditing(false);
  };

  return (
    <div className="border rounded-lg p-4">
      {isEditing ? (
        <>
          <Input
            value={editedStep.title}
            onChange={(e) => setEditedStep({ ...editedStep, title: e.target.value })}
          />
          <Textarea
            value={editedStep.description}
            onChange={(e) => setEditedStep({ ...editedStep, description: e.target.value })}
          />
          <Button onClick={handleSave}>Save</Button>
        </>
      ) : (
        <>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        </>
      )}
    </div>
  );
}
```

##### Gap 3.2: Drag & Drop Step Reordering

**User Requirement:**

> "As a user I would like to be able to drag and drop generated steps to re-arrange them"

**Current State:**

- No drag-and-drop support
- Steps stored as text, not structured

**Required Changes:**

**Package Installation:**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**UI Component (NEW):**

```typescript
// components/plan-step-sortable-list.tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableStep({ step }: { step: PlanStep }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PlanStepEditor step={step} />
    </div>
  );
}

export function PlanStepSortableList({ steps, planId }: Props) {
  const [items, setItems] = useState(steps);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update display orders in DB
      const stepOrders = newItems.map((item, index) => ({
        stepId: item.id,
        displayOrder: index
      }));

      await fetch(`/api/feature-planner/plan/${planId}/steps`, {
        method: 'PATCH',
        body: JSON.stringify({ stepOrders })
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items}
        strategy={verticalListSortingStrategy}
      >
        {items.map((step) => (
          <SortableStep key={step.id} step={step} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

##### Gap 3.3: Reusable Step Templates Library

**User Requirement:**

> "I could have a linting step that says to run `npm run lint:fix` or `npm run typecheck` and fix any errors identified and then I could just drag and drop that into the implementation plan wherever I want"

**Current State:**

- No template system
- No reusable steps
- No template library UI

**Required Changes:**

**Database Schema (NEW TABLE):**

```typescript
export const planStepTemplates = pgTable(
  'plan_step_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    // Template details
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description').notNull(),
    category: varchar('category', { length: 50 }).notNull(), // e.g., "linting", "testing", "build"

    // Step content
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    commands: jsonb('commands').$type<string[]>(),
    validationCommands: jsonb('validation_commands').$type<string[]>(),

    // Metadata
    estimatedDuration: varchar('estimated_duration', { length: 50 }),
    confidenceLevel: varchar('confidence_level', { length: 20 }).default('high'),

    // Sharing
    isPublic: boolean('is_public').default(false),
    usageCount: integer('usage_count').default(0),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('plan_step_templates_user_id_idx').on(table.userId),
    index('plan_step_templates_category_idx').on(table.category),
    index('plan_step_templates_is_public_idx').on(table.isPublic),
  ],
);
```

**Seed Default Templates:**

```typescript
// src/lib/db/seeds/default-step-templates.ts
export const defaultTemplates = [
  {
    name: 'Lint & Type Check',
    description: 'Run linting and type checking, fix any errors',
    category: 'quality',
    title: 'Code Quality Check',
    content: 'Run ESLint and TypeScript type checking. Fix all errors and warnings before proceeding.',
    commands: ['npm run lint:fix', 'npm run typecheck'],
    validationCommands: ['npm run lint', 'npm run typecheck'],
    estimatedDuration: '5-10 minutes',
    confidenceLevel: 'high',
    isPublic: true,
  },
  {
    name: 'Run Tests',
    description: 'Execute test suite and ensure all tests pass',
    category: 'testing',
    title: 'Test Suite Validation',
    content: 'Run the full test suite. Investigate and fix any failing tests.',
    commands: ['npm run test'],
    validationCommands: ['npm run test'],
    estimatedDuration: '10-15 minutes',
    confidenceLevel: 'high',
    isPublic: true,
  },
  {
    name: 'Database Migration',
    description: 'Generate and run database migration',
    category: 'database',
    title: 'Database Schema Update',
    content: 'Generate database migration from schema changes and apply to database.',
    commands: ['npm run db:generate', 'npm run db:migrate'],
    validationCommands: ['npm run typecheck'],
    estimatedDuration: '5 minutes',
    confidenceLevel: 'medium',
    isPublic: true,
  },
  {
    name: 'Build Check',
    description: 'Ensure production build succeeds',
    category: 'build',
    title: 'Production Build Validation',
    content: 'Run production build to ensure no build errors.',
    commands: ['npm run build'],
    validationCommands: [],
    estimatedDuration: '2-5 minutes',
    confidenceLevel: 'high',
    isPublic: true,
  },
];
```

**API Routes (NEW):**

```typescript
// /app/api/feature-planner/templates/route.ts

// GET - List templates
export async function GET(request: Request) {
  const { userId } = auth();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const templates = await db.query.planStepTemplates.findMany({
    where:
      category ?
        and(
          or(eq(planStepTemplates.userId, userId), eq(planStepTemplates.isPublic, true)),
          eq(planStepTemplates.category, category),
        )
      : or(eq(planStepTemplates.userId, userId), eq(planStepTemplates.isPublic, true)),
    orderBy: [desc(planStepTemplates.usageCount), desc(planStepTemplates.createdAt)],
  });

  return NextResponse.json({ templates });
}

// POST - Create template
export async function POST(request: Request) {
  const { userId } = auth();
  const templateData = await request.json();

  const [template] = await db
    .insert(planStepTemplates)
    .values({
      userId,
      ...templateData,
    })
    .returning();

  return NextResponse.json({ template });
}
```

**UI Component (NEW):**

```typescript
// components/step-template-library.tsx
export function StepTemplateLibrary({ onSelect }: { onSelect: (template: StepTemplate) => void }) {
  const { data: templates } = useQuery({
    queryKey: ['step-templates'],
    queryFn: () => fetch('/api/feature-planner/templates').then(r => r.json())
  });

  const categories = ['quality', 'testing', 'database', 'build'];

  return (
    <div className="border-r p-4 w-64">
      <h3 className="font-semibold mb-4">Step Templates</h3>

      {categories.map(category => (
        <div key={category} className="mb-4">
          <h4 className="text-sm font-medium mb-2 capitalize">{category}</h4>
          {templates?.templates
            .filter(t => t.category === category)
            .map(template => (
              <div
                key={template.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('template', JSON.stringify(template));
                }}
                className="p-2 mb-2 bg-gray-100 rounded cursor-move hover:bg-gray-200"
              >
                <div className="text-sm font-medium">{template.name}</div>
                <div className="text-xs text-gray-600">{template.description}</div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

// components/plan-editor.tsx
export function PlanEditor({ planId }: { planId: string }) {
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const templateData = e.dataTransfer.getData('template');
    const template = JSON.parse(templateData);

    // Create new step from template
    await fetch(`/api/feature-planner/plan/${planId}/steps`, {
      method: 'POST',
      body: JSON.stringify({
        ...template,
        templateId: template.id,
        isFromTemplate: true,
        displayOrder: steps.length
      })
    });

    // Increment template usage
    await fetch(`/api/feature-planner/templates/${template.id}/use`, {
      method: 'POST'
    });
  };

  return (
    <div className="flex">
      <StepTemplateLibrary />
      <div
        className="flex-1"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <PlanStepSortableList steps={steps} planId={planId} />
      </div>
    </div>
  );
}
```

##### Gap 3.4: Parallel Plan Generation

**User Requirement:**

> "As a user I would like to be able to use a single agent or multiple agents in parallel (this could be a tabbed UI and the user would be able to select which implementation plan they want to use)"

**Current State:**

- Single plan generation only
- No parallel execution
- No comparison/selection UI

**Required Changes:**

**Database Schema:**

```typescript
// Add agent tracking and selection to implementation_plan_generations
export const implementationPlanGenerations = pgTable('implementation_plan_generations', {
  // ... existing fields ...

  // NEW FIELDS for parallel support
  agentId: varchar('agent_id', { length: 100 }).notNull(), // e.g., 'planner-1', 'planner-2'
  isSelected: boolean('is_selected').default(false), // Which plan was chosen

  // ... rest of fields ...
});

// Update feature_plans to track selected generation
export const featurePlans = pgTable('feature_plans', {
  // ... existing fields ...

  selectedPlanGenerationId: uuid('selected_plan_generation_id').references(
    () => implementationPlanGenerations.id,
  ),

  // ... rest of fields ...
});
```

**Service Layer:**

```typescript
// feature-planner.service.ts
async runParallelPlanGeneration(
  planId: string,
  refinedRequest: string,
  discoveredFiles: FileDiscoveryResult[],
  agentCount: number = 1
) {
  const planPromises = Array.from(
    { length: agentCount },
    (_, i) => this.runSinglePlanGeneration(
      planId,
      refinedRequest,
      discoveredFiles,
      `planner-${i + 1}`
    )
  );

  const plans = await Promise.all(planPromises);
  return plans;
}
```

**UI Component:**

```typescript
// step-3-planning.tsx
export function Step3Planning({ planId }: { planId: string }) {
  const { data: planGenerations } = useQuery({
    queryKey: ['plan-generations', planId],
    queryFn: () => fetch(`/api/feature-planner/${planId}/plans`).then(r => r.json())
  });

  const selectPlan = async (generationId: string) => {
    await fetch(`/api/feature-planner/${planId}/select-plan`, {
      method: 'POST',
      body: JSON.stringify({ generationId })
    });
  };

  return (
    <Tabs defaultValue={planGenerations?.[0]?.agentId}>
      {planGenerations?.map(generation => (
        <TabsContent key={generation.id} value={generation.agentId}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3>{generation.agentId}</h3>
              <Button
                onClick={() => selectPlan(generation.id)}
                variant={generation.isSelected ? 'default' : 'outline'}
              >
                {generation.isSelected ? 'Selected' : 'Select This Plan'}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Duration:</span> {generation.estimatedDuration}
              </div>
              <div>
                <span className="font-medium">Complexity:</span> {generation.complexity}
              </div>
              <div>
                <span className="font-medium">Risk:</span> {generation.riskLevel}
              </div>
            </div>

            <PlanStepSortableList
              steps={generation.steps}
              planId={generation.id}
            />
          </div>
        </TabsContent>
      ))}

      <TabsList>
        {planGenerations?.map(generation => (
          <TabsTrigger key={generation.id} value={generation.agentId}>
            {generation.agentId}
            {generation.isSelected && <CheckCircle className="ml-2 h-4 w-4" />}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
```

---

### 4. General Features

#### ✅ What's Covered

- Database persistence for pause/resume
- View past planning history
- Real-time streaming (Phase 3)

#### ❌ Critical Gaps

##### Gap 4.1: Sub-agent Message Streaming

**User Requirement:**

> "As a user I would like to always see real time streaming of every message from the agent and any/all subagents"

**Current State:**

- SSE endpoint planned
- No differentiation between main agent and sub-agent messages
- No nested agent tracking

**Required Changes:**

**Database Schema:**

```typescript
// Update plan_execution_logs to track parent-child relationships
export const planExecutionLogs = pgTable('plan_execution_logs', {
  // ... existing fields ...

  // NEW FIELDS for sub-agent tracking
  parentLogId: uuid('parent_log_id').references(() => planExecutionLogs.id),
  agentLevel: integer('agent_level').default(0).notNull(), // 0 = main, 1+ = sub-agents

  // ... rest of fields ...
});
```

**Service Layer:**

```typescript
// Track nested agent calls
private async logExecution(
  planId: string,
  step: string,
  stepNumber: number,
  message: SDKMessage,
  parentLogId?: string  // NEW parameter
) {
  // Determine agent level based on parent
  const agentLevel = parentLogId
    ? await this.getAgentLevel(parentLogId) + 1
    : 0;

  await db.insert(planExecutionLogs).values({
    planId,
    step,
    stepNumber,
    agentResponse: JSON.stringify(message),
    parentLogId,
    agentLevel,
    startTime: new Date(),
  });
}
```

**SSE Endpoint Enhancement:**

```typescript
// /app/api/feature-planner/[planId]/stream/route.ts
export async function GET(request: Request, { params }: { params: { planId: string } }) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const message of query({
        prompt: generatePrompt(planId),
        options: { includePartialMessages: true },
      })) {
        // Detect if this is a sub-agent message
        const isSubAgent = message.type === 'agent' && message.agentId;

        const data = {
          ...message,
          isSubAgent,
          agentLevel: isSubAgent ? 1 : 0,
          timestamp: new Date().toISOString(),
        };

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

**UI Component:**

```typescript
// components/agent-message-stream.tsx
export function AgentMessageStream({ planId }: { planId: string }) {
  const [messages, setMessages] = useState<StreamMessage[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/feature-planner/${planId}/stream`);

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    return () => eventSource.close();
  }, [planId]);

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={cn(
            "p-2 rounded",
            msg.isSubAgent ? "ml-8 bg-blue-50" : "bg-gray-50"
          )}
        >
          <div className="flex items-center gap-2 text-xs text-gray-600">
            {msg.isSubAgent && <ArrowRight className="h-3 w-3" />}
            <span className="font-medium">
              {msg.isSubAgent ? `Sub-agent (${msg.agentId})` : 'Main Agent'}
            </span>
            <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="text-sm mt-1">{msg.content}</div>
        </div>
      ))}
    </div>
  );
}
```

---

## Updated Database Schema Summary

### New Tables Required

1. **`plan_steps`** - Structured implementation plan steps
2. **`plan_step_templates`** - Reusable step library

### Modified Tables Required

1. **`feature_plans`**
   - Add: `selectedDiscoverySessionId`
   - Add: `selectedPlanGenerationId`

2. **`feature_refinements`**
   - ✅ Already supports parallel (no changes needed)

3. **`file_discovery_sessions`**
   - Add: `agentId` for parallel support
   - Add: `isSelected` for selection tracking

4. **`discovered_files`**
   - Modify: `priority` enum to include 'critical'
   - Add: `role` field
   - Add: `integrationPoint` field
   - Add: `isManuallyAdded` field
   - Add: `addedByUserId` field

5. **`implementation_plan_generations`**
   - Add: `agentId` for parallel support
   - Add: `isSelected` for selection tracking

6. **`plan_execution_logs`**
   - Add: `parentLogId` for nested agent tracking
   - Add: `agentLevel` for hierarchy tracking

### Modified Enums

```typescript
// Before
export const filePriorityEnum = pgEnum('file_priority', ['high', 'medium', 'low']);

// After
export const filePriorityEnum = pgEnum('file_priority', ['critical', 'high', 'medium', 'low']);
```

### Enhanced JSONB Types

```typescript
// RefinementSettings enhancement
export interface RefinementSettings {
  agentCount: number;
  includeProjectContext: boolean;
  minOutputLength: number; // NEW
  maxOutputLength: number; // NEW
  parallelExecution?: boolean;
  customModel?: string;
}

// FileDiscoveryResult enhancement
export interface FileDiscoveryResult {
  filePath: string;
  priority: 'critical' | 'high' | 'medium' | 'low'; // Updated
  relevanceScore: number;
  description: string;
  reasoning?: string;
  role?: string; // NEW
  integrationPoint?: string; // NEW
  fileExists?: boolean;
  isManuallyAdded?: boolean; // NEW
}
```

---

## Updated Architecture Components

### New API Routes Required

```
/app/api/feature-planner/
├── files/
│   └── search/route.ts              # NEW - File autocomplete
├── templates/
│   ├── route.ts                     # NEW - CRUD for step templates
│   └── [templateId]/
│       └── use/route.ts             # NEW - Increment usage count
├── plan/
│   └── [planId]/
│       ├── steps/
│       │   └── route.ts             # NEW - CRUD for plan steps
│       └── select-plan/route.ts     # NEW - Select plan generation
└── [planId]/
    └── select-discovery/route.ts    # NEW - Select discovery session
```

### New UI Components Required

```
/app/(app)/feature-planner/components/
├── file-autocomplete.tsx            # NEW - File search/add
├── step-template-library.tsx        # NEW - Template sidebar
├── plan-step-editor.tsx             # NEW - Edit individual steps
├── plan-step-sortable-list.tsx      # NEW - Drag-and-drop steps
├── agent-message-stream.tsx         # NEW - Real-time streaming UI
└── refinement-settings.tsx          # MODIFY - Add length controls
```

### New Service Layer Methods

```typescript
class FeaturePlannerService {
  // File Discovery
  runParallelFileDiscovery(); // NEW
  addManualFile(); // NEW

  // Planning
  runParallelPlanGeneration(); // NEW
  createStepFromTemplate(); // NEW
  reorderPlanSteps(); // NEW

  // Templates
  createStepTemplate(); // NEW
  updateStepTemplate(); // NEW
  deleteStepTemplate(); // NEW
}
```

---

## Implementation Priority

### Phase 0: Schema & Foundation (3-4 days) - **MUST DO FIRST**

1. ✅ Update database schema with all new tables and fields
2. ✅ Create migration
3. ✅ Seed default step templates
4. ✅ Update TypeScript types

### Phase 1: Enhanced Refinement (2 days)

1. ✅ Add min/max length controls to settings UI
2. ✅ Add project context toggle
3. ✅ Update agent prompt generation

### Phase 2: Enhanced File Discovery (3 days)

1. ✅ Add "critical" priority support
2. ✅ Add role & integration point fields
3. ✅ Implement file autocomplete
4. ✅ Implement parallel file discovery
5. ✅ Build discovery comparison UI

### Phase 3: Structured Planning (4-5 days)

1. ✅ Create plan_steps table
2. ✅ Build step editor component
3. ✅ Implement drag-and-drop
4. ✅ Create step templates table
5. ✅ Build template library UI
6. ✅ Implement parallel plan generation
7. ✅ Build tabbed plan comparison UI

### Phase 4: Streaming Enhancement (2 days)

1. ✅ Enhance SSE endpoint for sub-agent tracking
2. ✅ Build nested message display UI

---

## Risk Assessment

### High Risk ⚠️

1. **Enum Migration** - PostgreSQL enum changes require careful migration
   - Mitigation: Use `ALTER TYPE ... ADD VALUE` or recreate enum

2. **Breaking Changes** - Schema changes may affect existing code
   - Mitigation: Comprehensive testing before deployment

### Medium Risk ⚡

1. **Drag-and-Drop Complexity** - DnD can be tricky to implement
   - Mitigation: Use battle-tested library (@dnd-kit)

2. **Parallel Execution** - Managing multiple concurrent agent calls
   - Mitigation: Proper error handling and Promise.all usage

### Low Risk ✅

1. **UI Components** - Standard React patterns
2. **API Routes** - Following existing patterns

---

## Recommendations

### Immediate Actions

1. **Approve Schema Changes** ✅
   - Review all schema modifications
   - Ensure all user requirements are captured
   - Approve new tables (plan_steps, plan_step_templates)

2. **Create Updated Schema File** ✅
   - Implement complete schema in `feature-planner.schema.ts`
   - Include all new tables and modifications
   - Update TypeScript types

3. **Generate Migration** ✅
   - Run `npm run db:generate`
   - Review migration SQL carefully
   - Handle enum changes properly

4. **Update Architecture Document** ✅
   - Revise Phase breakdown to include new features
   - Update component list
   - Add new API routes

5. **Begin Implementation** 🚀
   - Start with Phase 0 (Schema & Foundation)
   - Follow priority order above

### Long-term Considerations

1. **Performance Monitoring**
   - Track parallel execution performance
   - Monitor database query times
   - Optimize N+1 queries

2. **User Testing**
   - Beta test drag-and-drop UI
   - Validate step template usefulness
   - Gather feedback on parallel execution

3. **Documentation**
   - Document template creation guide
   - Create video tutorials for drag-and-drop
   - Write best practices guide

---

## Conclusion

The current architecture provides a **solid foundation** but requires **significant enhancements** to meet all user requirements. The gaps identified are **addressable** with the recommendations above, and implementation should follow the **phased approach** to manage complexity.

**Estimated Total Additional Effort:** 10-12 days beyond original 8-week plan

**Recommendation:** Proceed with schema updates and begin Phase 0 implementation immediately.

---

**Status:** ✅ Analysis Complete - Ready for Implementation
**Next Steps:** Create updated schema file and generate migration
