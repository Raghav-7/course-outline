/**
 * CourseOutline.tsx — Main widget entry point.
 *
 * Resolves Mendix datasource items into internal ContentItem[] array
 * and renders the CourseOutlinePanel.
 *
 * Architecture:
 *   - This widget is a NAVIGATOR only — it does not render video/text content.
 *   - When a user clicks an item, onItemClick fires with the item's Mendix context.
 *   - The Mendix app (nanoflow/microflow) handles what happens: play a video,
 *     show text, navigate to quiz, etc.
 *   - This is the composable Mendix architecture — single responsibility.
 */

import { createElement, ReactElement, useMemo } from "react";
import { CourseOutlineContainerProps } from "../typings/CourseOutlineProps";
import { ContentItem, parseContentType, parseItemStatus } from "./components/ContentItem";
import { CourseOutlinePanel } from "./components/CourseOutlinePanel";
import "./ui/CourseOutline.css";

export default function CourseOutline(props: CourseOutlineContainerProps): ReactElement {
    // ─── Resolve Mendix datasource into ContentItem[] ───
    const contentItems = useMemo<ContentItem[]>(() => {
        if (!props.contentItems || !props.contentItems.items || props.contentItems.items.length === 0) {
            return [];
        }

        return props.contentItems.items
            .map(item => {
                const title = props.itemTitle.get(item)?.value ?? "";
                if (!title.trim()) {
                    return null;
                }

                const onItemClick = props.onItemClick;
                const executeAction = onItemClick
                    ? () => {
                          const action = onItemClick.get(item);
                          if (action && action.canExecute && !action.isExecuting) {
                              action.execute();
                          }
                      }
                    : undefined;

                return {
                    id: item.id,
                    title: title.trim(),
                    description: props.itemDescription?.get(item)?.value ?? "",
                    contentType: parseContentType(props.itemContentType?.get(item)?.value),
                    groupName: props.itemGroupName?.get(item)?.value ?? "",
                    duration: props.itemDuration?.get(item)?.value ?? "",
                    status: parseItemStatus(props.itemStatus?.get(item)?.value),
                    sortOrder: Number(props.itemSortOrder?.get(item)?.value ?? 0),
                    isPreviewable: props.itemIsPreviewable?.get(item)?.value === true,
                    executeAction
                } as ContentItem;
            })
            .filter((item): item is ContentItem => item !== null);
    }, [
        props.contentItems,
        props.itemTitle,
        props.itemDescription,
        props.itemContentType,
        props.itemGroupName,
        props.itemDuration,
        props.itemStatus,
        props.itemSortOrder,
        props.itemIsPreviewable,
        props.onItemClick
    ]);

    const activeItemId = props.activeItemId?.value ?? "";

    // ─── Loading state ───
    if (props.contentItems && props.contentItems.status === "loading") {
        return (
            <div className={`course-nav-root course-nav-state-loading ${props.class}`} style={props.style}>
                <div className="course-nav-loading-indicator">
                    <div className="course-nav-loading-spinner" />
                    <p className="course-nav-loading-text">Loading course content…</p>
                </div>
            </div>
        );
    }

    // ─── Empty state ───
    if (contentItems.length === 0) {
        return (
            <div className={`course-nav-root course-nav-state-empty ${props.class}`} style={props.style}>
                <div className="course-nav-empty">
                    <svg
                        className="course-nav-empty-icon"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        <line x1="9" y1="7" x2="15" y2="7" />
                        <line x1="9" y1="11" x2="13" y2="11" />
                    </svg>
                    <p className="course-nav-empty-title">No content items</p>
                    <p className="course-nav-empty-hint">
                        Configure a data source with content items in Mendix Studio Pro.
                    </p>
                </div>
            </div>
        );
    }

    // ─── Render ───
    return (
        <div className={`course-nav-root ${props.class}`} style={props.style}>
            <CourseOutlinePanel
                items={contentItems}
                activeItemId={activeItemId}
                showSummaryBar={props.showSummaryBar}
                courseTitle={props.courseTitle?.value ?? ""}
                showDuration={props.showDuration}
                showContentTypeIcons={props.showContentTypeIcons}
                showNumbering={props.showNumbering}
                showProgress={props.showProgress}
                showDescription={props.showDescription}
                accordionSections={props.accordionSections}
                expandAllByDefault={props.expandAllByDefault}
            />
        </div>
    );
}
