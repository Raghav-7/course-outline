/**
 * ContentItemRow.tsx — Individual content item row.
 *
 * Layout: [status icon] [content type icon] [title area] [expand chevron] [preview badge] [duration]
 *
 * Click behavior (SEPARATE targets — per user requirement):
 *   - Clicking the ROW (title, icon, etc.) → fires onItemClick action
 *   - Clicking the CHEVRON → toggles description expand/collapse
 *   - Locked items are non-clickable (row click does nothing)
 *
 * Status indicators:
 *   - NotStarted: empty circle
 *   - InProgress: half-filled circle (accent color)
 *   - Completed: green checkmark
 *   - Locked: lock icon, entire row visually muted
 *
 * Accessibility:
 *   - role="treeitem" on root
 *   - aria-current="true" on active item
 *   - aria-disabled="true" on locked items
 *   - keyboard Enter/Space to activate
 *   - separate keyboard handling for expand chevron
 */

import { createElement, ReactElement, useState, useCallback, memo } from "react";
import { ContentItem, ContentType } from "./ContentItem";

export interface ContentItemRowProps {
    item: ContentItem;
    isActive: boolean;
    showDuration: boolean;
    showContentTypeIcons: boolean;
    showNumbering: boolean;
    showProgress: boolean;
    showDescription: boolean;
    numberLabel: string;
}

/* ─── Content Type Icons (SVG) ─── */

function ContentTypeIcon({ type }: { type: ContentType }): ReactElement {
    switch (type) {
        case "Video":
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="course-nav-item-type-svg"
                >
                    <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
            );
        case "Article":
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="course-nav-item-type-svg"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
            );
        case "Quiz":
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="course-nav-item-type-svg"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            );
        case "Resource":
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="course-nav-item-type-svg"
                >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
            );
        case "Assignment":
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="course-nav-item-type-svg"
                >
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <line x1="9" y1="12" x2="15" y2="12" />
                    <line x1="9" y1="16" x2="15" y2="16" />
                </svg>
            );
        default:
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="course-nav-item-type-svg"
                >
                    <circle cx="12" cy="12" r="10" />
                </svg>
            );
    }
}

/* ─── Status Icon ─── */

function StatusIcon({ status }: { status: string }): ReactElement {
    switch (status) {
        case "Completed":
            return (
                <span className="course-nav-item-status course-nav-item-status--completed" aria-label="Completed">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </span>
            );
        case "InProgress":
            return (
                <span className="course-nav-item-status course-nav-item-status--inprogress" aria-label="In Progress">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" opacity="0.25" />
                        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeLinecap="round" />
                    </svg>
                </span>
            );
        case "Locked":
            return (
                <span className="course-nav-item-status course-nav-item-status--locked" aria-label="Locked">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </span>
            );
        default:
            // NotStarted — empty circle
            return (
                <span className="course-nav-item-status course-nav-item-status--notstarted" aria-label="Not started">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                    </svg>
                </span>
            );
    }
}

/* ─── Component ─── */

export const ContentItemRow = memo(
    ({
        item,
        isActive,
        showDuration,
        showContentTypeIcons,
        showNumbering,
        showProgress,
        showDescription,
        numberLabel
    }: ContentItemRowProps): ReactElement => {
        const [isDescExpanded, setIsDescExpanded] = useState(false);
        const isLocked = item.status === "Locked";
        const hasDescription = showDescription && item.description && item.description.trim().length > 0;

        const handleItemClick = useCallback(() => {
            if (isLocked) {
                return;
            }
            if (item.executeAction) {
                item.executeAction();
            }
        }, [isLocked, item]);

        const handleItemKeyDown = useCallback(
            (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleItemClick();
                }
            },
            [handleItemClick]
        );

        const toggleDescription = useCallback((e: React.MouseEvent) => {
            e.stopPropagation();
            setIsDescExpanded(prev => !prev);
        }, []);

        const handleDescKeyDown = useCallback((e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                setIsDescExpanded(prev => !prev);
            }
        }, []);

        const rowClasses = [
            "course-nav-item",
            isActive ? "course-nav-item--active" : "",
            isLocked ? "course-nav-item--locked" : "",
            item.status === "Completed" ? "course-nav-item--completed" : "",
            item.status === "InProgress" ? "course-nav-item--inprogress" : ""
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <div
                className={rowClasses}
                role="treeitem"
                aria-current={isActive ? "true" : undefined}
                aria-disabled={isLocked ? "true" : undefined}
            >
                {/* Clickable row area */}
                <div
                    className="course-nav-item-row"
                    onClick={handleItemClick}
                    onKeyDown={handleItemKeyDown}
                    role="button"
                    tabIndex={isLocked ? -1 : 0}
                >
                    {/* Status indicator */}
                    {showProgress && <StatusIcon status={item.status} />}

                    {/* Content type icon */}
                    {showContentTypeIcons && (
                        <span className="course-nav-item-type">
                            <ContentTypeIcon type={item.contentType} />
                        </span>
                    )}

                    {/* Title area */}
                    <div className="course-nav-item-info">
                        <span className="course-nav-item-title">
                            {showNumbering && numberLabel && (
                                <span className="course-nav-item-number">{numberLabel}</span>
                            )}
                            {item.title}
                        </span>
                    </div>

                    {/* Description expand chevron (SEPARATE click target) */}
                    {hasDescription && (
                        <button
                            className={`course-nav-item-expand ${isDescExpanded ? "course-nav-item-expand--open" : ""}`}
                            onClick={toggleDescription}
                            onKeyDown={handleDescKeyDown}
                            type="button"
                            tabIndex={0}
                            aria-label={isDescExpanded ? "Collapse description" : "Expand description"}
                            aria-expanded={isDescExpanded}
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                    )}

                    {/* Preview badge */}
                    {item.isPreviewable && <span className="course-nav-item-preview">Preview</span>}

                    {/* Duration */}
                    {showDuration && item.duration && <span className="course-nav-item-duration">{item.duration}</span>}
                </div>

                {/* Expandable description */}
                {hasDescription && isDescExpanded && (
                    <div className="course-nav-item-desc">
                        <p className="course-nav-item-desc-text">{item.description}</p>
                    </div>
                )}
            </div>
        );
    }
);
