# Collection Organization - Detailed Feature Specification

## 🎯 **Core Organization Concept**

Based on your vision, users organize their bobbleheads using a flexible two-tier system:

- **Main Collection** - Every user has one primary collection
- **Sub-collections** - Optional organizational folders within the main collection
- **Tags** - Flexible labels that work at any level for detailed categorization

---

## 🏗️ **Data Hierarchy & Structure**

### **Organization Levels**

```
User
└── Main Collection (always exists)
    ├── Bobblehead 1 (can have tags)
    ├── Bobblehead 2 (can have tags)
    ├── Sub-collection: "Family Guy" (optional)
    │   ├── Bobblehead 3 (can have tags)
    │   └── Bobblehead 4 (can have tags)
    └── Sub-collection: "Star Wars" (optional)
        ├── Bobblehead 5 (can have tags)
        └── Bobblehead 6 (can have tags)
```

### **Core Rules**

- **One Main Collection** - Each user has exactly one primary collection
- **Optional Sub-collections** - Users can create 0-many sub-collections
- **Flat Sub-collection Structure** - No nested sub-collections (keeps it simple)
- **Flexible Item Placement** - Bobbleheads can be in main collection OR a sub-collection
- **Universal Tagging** - Tags work everywhere (main collection and sub-collections)

---

## 📁 **Sub-collection Management**

### **Sub-collection Properties**

- **Name** - User-defined name (e.g., "Family Guy", "Sports Teams")
- **Description** - Optional description of the sub-collection
- **Cover Image** - Representative image (auto or manual selection)
- **Privacy Level** - Can override main collection privacy
- **Item Count** - Automatic count of bobbleheads
- **Created Date** - When sub-collection was created
- **Last Updated** - When items were last added/modified

### **Sub-collection Creation**

- **Simple Creation** - "Create New Sub-collection" button
- **Name + Description** - Basic setup form
- **Privacy Inheritance** - Defaults to main collection privacy
- **Empty State** - Can create empty sub-collections to organize later

### **Sub-collection Management**

- **Rename** - Change sub-collection name/description
- **Reorder** - Drag and drop to reorder sub-collections
- **Merge** - Combine two sub-collections
- **Delete** - Remove sub-collection (moves items to main collection)
- **Duplicate** - Copy sub-collection structure (not items)

### **Moving Items Between Collections**

- **Drag and Drop** - Visual interface for moving items
- **Bulk Move** - Select multiple items to move at once
- **Move from Item Page** - Change sub-collection from bobblehead detail
- **Quick Actions** - Right-click context menu for moves

---

## 🏷️ **Tagging System**

### **Tag Structure**

- **Tag Name** - Simple text label (e.g., "Peter Griffin", "2023", "Rare")
- **Tag Color** - User-assigned color for visual organization
- **Usage Count** - How many items use this tag
- **Created Date** - When user first created this tag
- **Auto-complete** - Suggest existing tags while typing

### **Tag Creation & Management**

- **Inline Creation** - Create tags while adding/editing bobbleheads
- **Tag Manager** - Dedicated interface for bulk tag management
- **Tag Merging** - Combine similar tags (e.g., "StarWars" + "Star Wars")
- **Tag Deletion** - Remove unused tags
- **Tag Renaming** - Change tag names globally

### **Tag Usage Patterns**

- **Multiple Tags per Item** - Bobbleheads can have many tags
- **Cross-Collection Tags** - Same tags work across sub-collections
- **Tag Hierarchies** - Users can create informal hierarchies with naming (e.g., "Series: Family Guy", "Character: Peter")
- **Popular Tags** - Show frequently used tags for quick selection

### **Tag Display & Organization**

- **Tag Clouds** - Visual representation of tag usage
- **Alphabetical Sorting** - Organize tags A-Z
- **Usage Sorting** - Most used tags first
- **Color Grouping** - Group tags by assigned colors
- **Search Tags** - Find specific tags quickly

---

## 🔒 **Privacy & Inheritance System**

### **Privacy Levels**

- **Private** - Only owner can see
- **Followers Only** - Visible to users who follow this collection
- **Public** - Visible to everyone
- **Link Only** - Visible to anyone with direct link

### **Privacy Inheritance Rules**

```
Main Collection Privacy
├── Sub-collection 1 (inherits or overrides)
│   ├── Bobblehead A (inherits from sub-collection)
│   └── Bobblehead B (can override individual privacy)
└── Sub-collection 2 (inherits or overrides)
    ├── Bobblehead C (inherits from sub-collection)
    └── Bobblehead D (can override individual privacy)
```

### **Privacy Control Flows**

- **Default Inheritance** - New items inherit from their container
- **Explicit Override** - Users can set specific privacy per item
- **Bulk Privacy Changes** - Update privacy for entire sub-collections
- **Privacy Warnings** - Alert when making private items public

### **Privacy Scenarios**

- **Public Collection, Private Sub-collection** - Some themes kept private
- **Private Collection, Public Items** - Mostly private but showcase specific items
- **Mixed Privacy** - Different sub-collections have different privacy levels

---

## 📊 **Collection Display & Views**

### **Main Collection Overview**

- **Collection Stats** - Total items, sub-collections count, recent additions
- **Recent Activity** - Latest additions and updates
- **Featured Items** - Highlighted bobbleheads (user or auto-selected)
- **Sub-collection Grid** - Visual preview of each sub-collection
- **Quick Actions** - Add item, create sub-collection, manage tags

### **Sub-collection Views**

- **Grid View** - Photo thumbnails in grid layout
- **List View** - Detailed list with key information
- **Tag View** - Organized by tags within sub-collection
- **Timeline View** - Chronological by acquisition date
- **Value View** - Sorted by purchase price (if tracked)

### **Collection Statistics**

- **Item Counts** - Total and per sub-collection
- **Tag Distribution** - Most used tags across collection
- **Timeline Stats** - Acquisition patterns over time
- **Value Stats** - Total investment (if price tracking enabled)
- **Activity Stats** - Views, likes, comments on collection

---

## 🔍 **Search & Filtering Within Collections**

### **Collection-Level Search**

- **Global Collection Search** - Search across entire collection
- **Sub-collection Search** - Search within specific sub-collection
- **Tag-based Filtering** - Filter by one or multiple tags
- **Date Range Filtering** - Filter by acquisition dates
- **Status Filtering** - Filter by item status (owned, wished, etc.)

### **Advanced Filtering Options**

- **Multi-tag Selection** - AND/OR logic for tag combinations
- **Price Range** - Filter by purchase price (if tracked)
- **Condition Filter** - Filter by item condition
- **Photo Filter** - Items with/without photos
- **Custom Field Filters** - Filter by user-defined fields

### **Saved Filters**

- **Filter Presets** - Save commonly used filter combinations
- **Quick Filters** - One-click access to saved filters
- **Filter Sharing** - Share filter views with others (if collection is public)

---

## 🎛️ **User Experience & Interface**

### **Collection Dashboard Layout**

```
[Collection Header: Name, Stats, Quick Actions]
[Sub-collection Navigation Bar]
[Filter/Search Bar]
[Content Area: Grid/List/Tag View]
[Floating Action Button: Add Item]
```

### **Navigation Patterns**

- **Breadcrumb Navigation** - Main Collection > Sub-collection > Item
- **Tab Navigation** - Switch between sub-collections
- **Quick Jump** - Dropdown to jump to any sub-collection
- **Back/Forward** - Browser-like navigation within collection

### **Responsive Design**

- **Mobile View** - Collapsible navigation, simplified layout
- **Tablet View** - Optimized for touch interaction
- **Desktop View** - Full feature access, multi-panel layout

---

## ⚡ **Quick Actions & Shortcuts**

### **Collection Management Shortcuts**

- **Quick Add** - Floating button to add item to current view
- **Bulk Select** - Checkbox mode for bulk operations
- **Keyboard Shortcuts** - Power user keyboard navigation
- **Context Menus** - Right-click for quick actions

### **Organization Shortcuts**

- **Quick Tag** - Apply tags to multiple items at once
- **Quick Move** - Move items between sub-collections easily
- **Quick Privacy** - Change privacy for multiple items
- **Smart Suggestions** - Suggest sub-collections based on tags

---

## 📱 **Mobile-Specific Organization Features**

### **Mobile Organization Tools**

- **Swipe Actions** - Swipe to move, tag, or delete
- **Long Press Menus** - Access organization options
- **Simplified Views** - Optimized for small screens
- **Voice Tagging** - Speak tags instead of typing

### **Mobile Quick Actions**

- **Camera Integration** - Add photo and create item in one flow
- **Location Tags** - Auto-tag based on location (optional)
- **Quick Categories** - Preset buttons for common sub-collections

---

## 🔄 **Import/Export & Migration**

### **Bulk Organization Operations**

- **CSV Import** - Import items with sub-collection assignments
- **Bulk Re-organization** - Move many items at once
- **Tag Import** - Import tag structures from other systems
- **Collection Templates** - Pre-built organization structures

### **Migration Tools**

- **Collection Backup** - Export entire collection structure
- **Sub-collection Export** - Export specific sub-collections
- **Tag Export** - Export tag definitions and assignments
- **Privacy Export** - Export privacy settings for backup

---

## 🎯 **User Scenarios & Workflows**

### **Scenario 1: Simple Tag-Only User**

1. User creates main collection
2. Adds bobbleheads with descriptive tags
3. Uses tag filtering to find items
4. No sub-collections needed

### **Scenario 2: Organized Sub-collection User**

1. User creates main collection
2. Creates sub-collections for different themes
3. Adds bobbleheads to appropriate sub-collections
4. Uses tags within sub-collections for fine-grained organization
5. Manages privacy per sub-collection

### **Scenario 3: Mixed Organization User**

1. User starts with simple tagging
2. Grows collection and creates some sub-collections
3. Keeps some items in main collection, others in sub-collections
4. Uses both systems as needed

---

## 🗃️ **Database Schema Implications**

### **Core Tables Needed**

- **collections** - Main collection per user
- **sub_collections** - Optional organizational folders
- **bobbleheads** - Items (linked to collection OR sub_collection)
- **tags** - Tag definitions
- **bobblehead_tags** - Many-to-many tag assignments
- **privacy_settings** - Privacy rules and inheritance

### **Key Relationships**

- User → Collection (one-to-one)
- Collection → Sub_collections (one-to-many)
- Collection/Sub_collection → Bobbleheads (one-to-many)
- Bobbleheads → Tags (many-to-many)
- All entities → Privacy_settings (flexible association)

### **Critical Design Decisions**

- **Bobblehead location** - Either in main collection OR sub-collection (not both)
- **Privacy inheritance** - How to efficiently query with privacy rules
- **Tag uniqueness** - Per-user or global tag definitions
- **Soft deletes** - For sub-collections and organization history

---
