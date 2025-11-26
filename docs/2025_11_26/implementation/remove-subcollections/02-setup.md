# Setup and Specialist Routing

**Timestamp**: 2025-11-26T10:05:00Z

## Extracted Steps Summary

Total: 22 implementation steps identified from plan.

## Step Routing Table

| Step | Title                                                             | Specialist                 | Files                                                     | Multi-Domain      |
| ---- | ----------------------------------------------------------------- | -------------------------- | --------------------------------------------------------- | ----------------- |
| 1    | Remove Database Schema Definitions                                | database-specialist        | src/lib/db/schema/\*.ts                                   | No                |
| 2    | Generate and Review Database Migration                            | database-specialist        | migrations/                                               | No                |
| 3    | Remove Subcollection Constants                                    | general-purpose            | src/lib/constants/\*.ts                                   | No                |
| 4    | Delete Subcollection Core Logic Files                             | general-purpose            | validations, actions, queries, facades                    | Yes (delete only) |
| 5    | Remove Subcollection References from Collections Query/Facade     | facade-specialist          | collections.query.ts, collections.facade.ts               | No                |
| 6    | Remove Subcollection References from Bobbleheads Query/Facade     | facade-specialist          | bobbleheads-query.ts, bobbleheads.facade.ts               | No                |
| 7    | Remove Subcollection References from Social Query/Facade          | facade-specialist          | social.query.ts, social.facade.ts                         | No                |
| 8    | Remove Subcollection References from Search Query/Facade          | facade-specialist          | content-search.query.ts, content-search.facade.ts         | No                |
| 9    | Remove Subcollection References from Content Reports Query/Facade | facade-specialist          | content-reports.query.ts, content-reports.facade.ts       | No                |
| 10   | Remove Subcollection References from Utilities                    | general-purpose            | cache-tags.utils.ts, types/\*.ts                          | No                |
| 11   | Delete Subcollection Route Directory                              | general-purpose            | src/app/(app)/collections/[collectionSlug]/subcollection/ | No                |
| 12   | Delete Subcollection Feature Components                           | general-purpose            | src/components/feature/subcollections/                    | No                |
| 13   | Remove Subcollection Components from Dashboard                    | general-purpose            | src/app/(app)/dashboard/collection/\*/components/         | No                |
| 14   | Update Collection Delete Component                                | react-component-specialist | collection-delete.tsx                                     | No                |
| 15   | Update Dashboard Collection Actions                               | react-component-specialist | collection-actions.tsx                                    | No                |
| 16   | Update Bobblehead Navigation Component                            | react-component-specialist | bobblehead-navigation.tsx                                 | No                |
| 17   | Update Dashboard Collection Page                                  | react-component-specialist | dashboard/collection/\*/page.tsx                          | No                |
| 18   | Update Middleware                                                 | general-purpose            | src/middleware.ts                                         | No                |
| 19   | Search and Remove Remaining Subcollection References              | general-purpose            | codebase-wide search                                      | Yes               |
| 20   | Regenerate Type-Safe Routes                                       | general-purpose            | generated route types                                     | No                |
| 21   | Apply Database Migration                                          | database-specialist        | database                                                  | No                |
| 22   | Final Comprehensive Testing                                       | test-specialist            | all                                                       | No                |

## Specialist Usage Summary

- **database-specialist**: Steps 1, 2, 21
- **facade-specialist**: Steps 5, 6, 7, 8, 9
- **react-component-specialist**: Steps 14, 15, 16, 17
- **general-purpose**: Steps 3, 4, 10, 11, 12, 13, 18, 19, 20
- **test-specialist**: Step 22

## Dependencies

- Steps 1-19 must complete before Step 20 (route regeneration)
- Steps 1-20 must complete before Step 21 (migration)
- All steps must complete before Step 22 (final testing)
- TypeScript errors expected during Steps 1-19 (intentional)

## Checkpoint

Setup complete. Beginning implementation with Step 1.
