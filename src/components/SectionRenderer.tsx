/**
 * SectionRenderer.tsx — Recursive section/group renderer.
 *
 * Renders a collapsible section header with:
 *   - Chevron (expand/collapse)
 *   - Optional numbering (1, 2, 3...)
 *   - Section name
 *   - Item count badge + total duration
 *
 * Body contains:
 *   - Direct child items (ContentItemRow)
 *   - Nested sub-sections (recursive SectionRenderer)
 *
 * Accessibility:
 *   - role="treeitem" on section headers
 *   - aria-expanded for collapse state
 *   - keyboard navigation (Enter/Space to toggle)
 *   - data-depth for CSS-driven indentation
 */

import { createElement, ReactElement, useMemo, memo } from "react";
import { SectionNode } from "./ContentItem";
import { ContentItemRow } from "./ContentItemRow";

export interface SectionRendererProps {
    node: SectionNode;
    sectionIndex: number;
    parentNumber: string;
    expandedSections: Set<string>;
    toggleSection: (fullPath: string) => void;
    activeItemId: string;
    showDuration: boolean;
    showContentTypeIcons: boolean;
    showNumbering: boolean;
    showProgress: boolean;
    showDescription: boolean;
}

/** Count total items in a section including all descendants */
function countItems(node: SectionNode): number {
    let count = node.items.length;
    for (const child of node.children) {
        count += countItems(child);
    }
    return count;
}

/** Sum durations in a section tree (returns formatted string or empty) */
function sumDurations(node: SectionNode): string {
    let totalSeconds = 0;
    let hasTime = false;

    function walk(n: SectionNode): void {
        for (const item of n.items) {
            if (!item.duration) {
                continue;
            }
            const parts = item.duration.split(":").map(p => parseInt(p.trim(), 10));
            if (parts.length === 2 && parts.every(p => !isNaN(p))) {
                totalSeconds += parts[0] * 60 + parts[1];
                hasTime = true;
            } else if (parts.length === 3 && parts.every(p => !isNaN(p))) {
                totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
                hasTime = true;
            }
        }
        n.children.forEach(walk);
    }
    walk(node);

    if (!hasTime || totalSeconds === 0) {
        return "";
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}min`;
}

/** Check if section or descendants contain the active item */
function containsActive(node: SectionNode, activeId: string): boolean {
    if (node.items.some(item => item.id === activeId)) {
        return true;
    }
    return node.children.some(child => containsActive(child, activeId));
}

/** Count completed items in a section tree */
function countCompleted(node: SectionNode): number {
    let count = 0;
    for (const item of node.items) {
        if (item.status === "Completed") {
            count++;
        }
    }
    for (const child of node.children) {
        count += countCompleted(child);
    }
    return count;
}

export const SectionRenderer = memo(function SectionRenderer({
    node,
    sectionIndex,
    parentNumber,
    expandedSections,
    toggleSection,
    activeItemId,
    showDuration,
    showContentTypeIcons,
    showNumbering,
    showProgress,
    showDescription
}: SectionRendererProps): ReactElement {
    const isExpanded = expandedSections.has(node.fullPath);
    const hasActive = containsActive(node, activeItemId);
    const sectionNumber = parentNumber ? `${parentNumber}.${sectionIndex}` : `${sectionIndex}`;

    const totalItems = useMemo(() => countItems(node), [node]);
    const completedItems = useMemo(() => countCompleted(node), [node]);
    const sectionDuration = useMemo(() => sumDurations(node), [node]);

    const sectionClasses = [
        "course-nav-section",
        isExpanded ? "course-nav-section--expanded" : "",
        hasActive ? "course-nav-section--active" : ""
    ]
        .filter(Boolean)
        .join(" ");

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleSection(node.fullPath);
        }
    };

    return (
        <div className={sectionClasses} data-depth={node.depth} role="treeitem" aria-expanded={isExpanded}>
            <div
                className="course-nav-section-header"
                onClick={() => toggleSection(node.fullPath)}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
            >
                <span className={`course-nav-section-chevron ${isExpanded ? "course-nav-section-chevron--open" : ""}`}>
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
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>

                <div className="course-nav-section-title-block">
                    <span className="course-nav-section-name">
                        {showNumbering && <span className="course-nav-section-number">{sectionNumber}.</span>}
                        {node.name}
                    </span>
                    <span className="course-nav-section-meta">
                        {totalItems > 0 && (
                            <span>
                                {showProgress && completedItems > 0
                                    ? `${completedItems}/${totalItems} completed`
                                    : `${totalItems} ${totalItems === 1 ? "lesson" : "lessons"}`}
                            </span>
                        )}
                        {showDuration && sectionDuration && (
                            <span className="course-nav-section-duration-group">
                                <span className="course-nav-section-meta-dot">•</span>
                                <span>{sectionDuration}</span>
                            </span>
                        )}
                    </span>
                </div>
            </div>

            {isExpanded && (
                <div className="course-nav-section-body">
                    {/* Direct items in this section */}
                    {node.items.map((item, localIdx) => (
                        <ContentItemRow
                            key={item.id}
                            item={item}
                            isActive={item.id === activeItemId}
                            showDuration={showDuration}
                            showContentTypeIcons={showContentTypeIcons}
                            showNumbering={showNumbering}
                            showProgress={showProgress}
                            showDescription={showDescription}
                            numberLabel={showNumbering ? `${sectionNumber}.${localIdx + 1}` : ""}
                        />
                    ))}

                    {/* Nested sub-sections */}
                    {node.children.map((child, childIdx) => (
                        <SectionRenderer
                            key={child.fullPath}
                            node={child}
                            sectionIndex={childIdx + 1}
                            parentNumber={sectionNumber}
                            expandedSections={expandedSections}
                            toggleSection={toggleSection}
                            activeItemId={activeItemId}
                            showDuration={showDuration}
                            showContentTypeIcons={showContentTypeIcons}
                            showNumbering={showNumbering}
                            showProgress={showProgress}
                            showDescription={showDescription}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});
