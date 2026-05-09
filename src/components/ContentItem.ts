/**
 * ContentItem.ts — Shared interfaces for Course Content Navigator.
 *
 * Content types supported:
 *   Video, Article, Quiz, Resource, Assignment
 *
 * Status values:
 *   NotStarted, InProgress, Completed, Locked
 *
 * Future-ready: The ContentType type is a string union.
 * New types (LiveSession, ExternalLink, CodingExercise, Checklist)
 * can be added by extending the union — no structural changes needed.
 */

/** Supported content types */
export type ContentType = "Video" | "Article" | "Quiz" | "Resource" | "Assignment";

/** Item completion/access status */
export type ItemStatus = "NotStarted" | "InProgress" | "Completed" | "Locked";

/** Normalized content item — resolved from Mendix datasource */
export interface ContentItem {
    /** Mendix object ID */
    id: string;
    /** Display title */
    title: string;
    /** Optional expandable description (plain text or simple text) */
    description: string;
    /** Content type for icon and behavior */
    contentType: ContentType;
    /** Section/group path using "/" delimiter for nesting */
    groupName: string;
    /** Display duration string (e.g., "1:11", "5 min read") */
    duration: string;
    /** Current status */
    status: ItemStatus;
    /** Sort order within group */
    sortOrder: number;
    /** Whether this item shows a "Preview" badge */
    isPreviewable: boolean;
    /** Fires the onItemClick action for this item */
    executeAction?: () => void;
}

/** Internal tree node for grouped sections */
export interface SectionNode {
    /** Display name (last segment of path) */
    name: string;
    /** Full path for identification (e.g., "Module 1/Lesson 1") */
    fullPath: string;
    /** Nesting depth (0 = top-level) */
    depth: number;
    /** Child sections */
    children: SectionNode[];
    /** Content items directly in this section */
    items: ContentItem[];
}

/**
 * Parse a content type string into a typed ContentType.
 * Falls back to "Video" for unrecognized values.
 */
export function parseContentType(value: string | undefined | null): ContentType {
    if (!value) {
        return "Video";
    }
    const normalized = value.trim();
    switch (normalized) {
        case "Video":
        case "Article":
        case "Quiz":
        case "Resource":
        case "Assignment":
            return normalized;
        default:
            return "Video";
    }
}

/**
 * Parse a status string into a typed ItemStatus.
 * Falls back to "NotStarted" for unrecognized values.
 */
export function parseItemStatus(value: string | undefined | null): ItemStatus {
    if (!value) {
        return "NotStarted";
    }
    const normalized = value.trim();
    switch (normalized) {
        case "NotStarted":
        case "InProgress":
        case "Completed":
        case "Locked":
            return normalized;
        default:
            return "NotStarted";
    }
}
