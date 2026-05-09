/**
 * CourseOutlinePanel.tsx — Main panel component for the Course Content Navigator.
 *
 * Renders:
 *   1. Summary bar — "X sections • Y lessons • Z total" + Expand All toggle
 *   2. Ungrouped items (items without a groupName)
 *   3. Grouped section tree (recursive, unlimited nesting via "/" delimiter)
 *
 * Performance:
 *   - Tree built via useMemo (only recalculated when items change)
 *   - Expand/collapse state managed via Set<string> for O(1) lookups
 *   - Individual sections memoized to avoid full-tree rerenders
 *
 * DOM structure:
 *   .course-nav-panel
 *     .course-nav-summary
 *     .course-nav-content
 *       .course-nav-section[data-depth="0"]
 *         .course-nav-section-header
 *         .course-nav-section-body
 *           .course-nav-item
 *           .course-nav-section[data-depth="1"]
 *             ...recursive...
 */

import { createElement, ReactElement, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { ContentItem, SectionNode } from "./ContentItem";
import { SectionRenderer } from "./SectionRenderer";
import { ContentItemRow } from "./ContentItemRow";

export interface CourseOutlinePanelProps {
    items: ContentItem[];
    activeItemId: string;
    showSummaryBar: boolean;
    courseTitle: string;
    showDuration: boolean;
    showContentTypeIcons: boolean;
    showNumbering: boolean;
    showProgress: boolean;
    showDescription: boolean;
    accordionSections: boolean;
    expandAllByDefault: boolean;
}

/* ─── Tree builder ─── */

function buildSectionTree(items: ContentItem[]): { tree: SectionNode[]; ungrouped: ContentItem[] } {
    const rootNodes: SectionNode[] = [];
    const nodeMap = new Map<string, SectionNode>();
    const ungrouped: ContentItem[] = [];

    for (const item of items) {
        const groupPath = (item.groupName || "").trim();

        if (!groupPath) {
            ungrouped.push(item);
            continue;
        }

        const segments = groupPath
            .split("/")
            .map(s => s.trim())
            .filter(s => s.length > 0);
        let currentPath = "";

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const parentPath = currentPath;
            currentPath = currentPath ? `${currentPath}/${segment}` : segment;

            if (!nodeMap.has(currentPath)) {
                const node: SectionNode = {
                    name: segment,
                    fullPath: currentPath,
                    depth: i,
                    children: [],
                    items: []
                };
                nodeMap.set(currentPath, node);

                if (parentPath) {
                    const parent = nodeMap.get(parentPath);
                    if (parent) {
                        parent.children.push(node);
                    }
                } else {
                    rootNodes.push(node);
                }
            }
        }

        const deepestNode = nodeMap.get(currentPath);
        if (deepestNode) {
            deepestNode.items.push(item);
        }
    }

    // Sort items within each group by sortOrder
    for (const node of nodeMap.values()) {
        node.items.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    ungrouped.sort((a, b) => a.sortOrder - b.sortOrder);

    return { tree: rootNodes, ungrouped };
}

/* ─── Utility: get all paths containing active item ─── */

function getActivePathsFromTree(nodes: SectionNode[], activeId: string): Set<string> {
    const paths = new Set<string>();
    function walk(node: SectionNode): boolean {
        const hasActive = node.items.some(item => item.id === activeId);
        const childHasActive = node.children.some(child => walk(child));
        if (hasActive || childHasActive) {
            paths.add(node.fullPath);
            return true;
        }
        return false;
    }
    nodes.forEach(walk);
    return paths;
}

/* ─── Utility: get all section paths ─── */

function getAllPaths(nodes: SectionNode[]): Set<string> {
    const paths = new Set<string>();
    function walk(node: SectionNode) {
        paths.add(node.fullPath);
        node.children.forEach(walk);
    }
    nodes.forEach(walk);
    return paths;
}

/* ─── Utility: compute summary stats ─── */

interface SummaryStats {
    sectionCount: number;
    lessonCount: number;
    totalDuration: string;
}

function computeSummary(tree: SectionNode[], ungrouped: ContentItem[]): SummaryStats {
    let sectionCount = 0;
    let lessonCount = ungrouped.length;
    const durations: string[] = [];

    function walk(node: SectionNode) {
        sectionCount++;
        lessonCount += node.items.length;
        for (const item of node.items) {
            if (item.duration) {
                durations.push(item.duration);
            }
        }
        node.children.forEach(walk);
    }
    tree.forEach(walk);

    for (const item of ungrouped) {
        if (item.duration) {
            durations.push(item.duration);
        }
    }

    // Try to sum durations if they're in m:ss or h:mm:ss format
    let totalSeconds = 0;
    let hasTimeDurations = false;

    for (const d of durations) {
        const parts = d.split(":").map(p => parseInt(p.trim(), 10));
        if (parts.length === 2 && parts.every(p => !isNaN(p))) {
            totalSeconds += parts[0] * 60 + parts[1];
            hasTimeDurations = true;
        } else if (parts.length === 3 && parts.every(p => !isNaN(p))) {
            totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
            hasTimeDurations = true;
        }
    }

    let totalDuration = "";
    if (hasTimeDurations && totalSeconds > 0) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        if (hours > 0) {
            totalDuration = `${hours}h ${minutes}m`;
        } else {
            totalDuration = `${minutes}m`;
        }
    }

    return { sectionCount, lessonCount, totalDuration };
}

/* ─── Component ─── */

export function CourseOutlinePanel({
    items,
    activeItemId,
    showSummaryBar,
    courseTitle,
    showDuration,
    showContentTypeIcons,
    showNumbering,
    showProgress,
    showDescription,
    accordionSections,
    expandAllByDefault
}: CourseOutlinePanelProps): ReactElement {
    const { tree, ungrouped } = useMemo(() => buildSectionTree(items), [items]);
    const isGrouped = tree.length > 0;
    const summary = useMemo(() => computeSummary(tree, ungrouped), [tree, ungrouped]);

    // Active section paths
    const activePaths = useMemo(() => getActivePathsFromTree(tree, activeItemId), [tree, activeItemId]);

    // Expanded state
    const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
        if (expandAllByDefault) {
            return getAllPaths(tree);
        }
        return new Set(activePaths);
    });

    // Track if "expand all" is toggled
    const [isAllExpanded, setIsAllExpanded] = useState(expandAllByDefault);

    // Auto-expand when active item changes
    const prevActiveRef = useRef(activeItemId);
    useEffect(() => {
        if (activeItemId !== prevActiveRef.current) {
            prevActiveRef.current = activeItemId;
            const newActivePaths = getActivePathsFromTree(tree, activeItemId);
            setExpandedSections(prev => {
                if (accordionSections) {
                    return newActivePaths;
                }
                const next = new Set(prev);
                newActivePaths.forEach(p => next.add(p));
                return next;
            });
        }
    }, [activeItemId, tree, accordionSections]);

    const toggleSection = useCallback(
        (fullPath: string) => {
            setExpandedSections(prev => {
                if (accordionSections) {
                    const pathParts = fullPath.split("/");
                    const parentPath = pathParts.slice(0, -1).join("/");
                    const next = new Set<string>();
                    prev.forEach(p => {
                        const pParts = p.split("/");
                        const pParent = pParts.slice(0, -1).join("/");
                        if (pParts.length !== pathParts.length || pParent !== parentPath) {
                            next.add(p);
                        }
                    });
                    if (!prev.has(fullPath)) {
                        next.add(fullPath);
                        const active = getActivePathsFromTree(tree, activeItemId);
                        active.forEach(p => {
                            if (p.startsWith(fullPath + "/")) {
                                next.add(p);
                            }
                        });
                    }
                    return next;
                }
                const next = new Set(prev);
                if (next.has(fullPath)) {
                    next.delete(fullPath);
                } else {
                    next.add(fullPath);
                }
                return next;
            });
            setIsAllExpanded(false);
        },
        [accordionSections, tree, activeItemId]
    );

    const toggleExpandAll = useCallback(() => {
        setIsAllExpanded(prev => {
            const next = !prev;
            if (next) {
                setExpandedSections(getAllPaths(tree));
            } else {
                setExpandedSections(getActivePathsFromTree(tree, activeItemId));
            }
            return next;
        });
    }, [tree, activeItemId]);

    return (
        <div className="course-nav-panel">
            {/* Summary bar */}
            {showSummaryBar && isGrouped && (
                <div className="course-nav-summary">
                    <div className="course-nav-summary-stats">
                        {courseTitle && <span className="course-nav-summary-title">{courseTitle}</span>}
                        <span className="course-nav-summary-meta">
                            {summary.sectionCount > 0 && (
                                <span>
                                    {summary.sectionCount} {summary.sectionCount === 1 ? "section" : "sections"}
                                </span>
                            )}
                            {summary.sectionCount > 0 && summary.lessonCount > 0 && (
                                <span className="course-nav-summary-dot">•</span>
                            )}
                            {summary.lessonCount > 0 && (
                                <span>
                                    {summary.lessonCount} {summary.lessonCount === 1 ? "lesson" : "lessons"}
                                </span>
                            )}
                            {summary.totalDuration && (
                                <span className="course-nav-summary-duration-group">
                                    <span className="course-nav-summary-dot">•</span>
                                    <span>{summary.totalDuration}</span>
                                </span>
                            )}
                        </span>
                    </div>
                    <button
                        className="course-nav-expand-all-btn"
                        onClick={toggleExpandAll}
                        type="button"
                        aria-label={isAllExpanded ? "Collapse all sections" : "Expand all sections"}
                    >
                        {isAllExpanded ? "Collapse all" : "Expand all"}
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="course-nav-content" role="tree">
                {/* Ungrouped items */}
                {ungrouped.length > 0 && (
                    <div className="course-nav-ungrouped" role="group">
                        {ungrouped.map(item => (
                            <ContentItemRow
                                key={item.id}
                                item={item}
                                isActive={item.id === activeItemId}
                                showDuration={showDuration}
                                showContentTypeIcons={showContentTypeIcons}
                                showNumbering={showNumbering}
                                showProgress={showProgress}
                                showDescription={showDescription}
                                numberLabel=""
                            />
                        ))}
                    </div>
                )}

                {/* Grouped sections */}
                {tree.map((node, idx) => (
                    <SectionRenderer
                        key={node.fullPath}
                        node={node}
                        sectionIndex={idx + 1}
                        parentNumber=""
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
        </div>
    );
}
