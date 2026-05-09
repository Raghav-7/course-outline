/**
 * CourseOutline.editorPreview.tsx — Studio Pro design-time preview.
 *
 * Displays a clean preview of the widget configuration in the Mendix page editor.
 */

import { createElement, ReactElement } from "react";
import { CourseOutlinePreviewProps } from "../typings/CourseOutlineProps";

export function preview(props: CourseOutlinePreviewProps): ReactElement {
    const hasData = props.contentItems !== null;
    const hasGroups = hasData && !!props.itemGroupName;

    return (
        <div
            style={{
                width: "100%",
                minHeight: "140px",
                backgroundColor: "#fafafa",
                color: "#1a1a1a",
                display: "flex",
                flexDirection: "column" as const,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                overflow: "hidden",
                padding: "20px"
            }}
        >
            {/* Icon */}
            <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b7280"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: "10px", opacity: 0.7 }}
            >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <line x1="9" y1="7" x2="15" y2="7" />
                <line x1="9" y1="11" x2="13" y2="11" />
            </svg>

            <h3 style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>Course Content Navigator</h3>
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#6b7280" }}>for Mendix</p>

            {/* Config badges */}
            {hasData && (
                <div
                    style={{
                        display: "flex",
                        gap: "6px",
                        marginTop: "12px",
                        flexWrap: "wrap" as const,
                        justifyContent: "center"
                    }}
                >
                    <span
                        style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(124, 58, 237, 0.08)",
                            color: "#7c3aed",
                            fontSize: "10px",
                            fontWeight: 600,
                            letterSpacing: "0.3px"
                        }}
                    >
                        {hasGroups ? "GROUPED" : "FLAT"} CONTENT
                    </span>
                    {props.showProgress && (
                        <span
                            style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                backgroundColor: "rgba(34, 197, 94, 0.08)",
                                color: "#22c55e",
                                fontSize: "10px",
                                fontWeight: 600
                            }}
                        >
                            PROGRESS
                        </span>
                    )}
                    {props.showDescription && (
                        <span
                            style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                backgroundColor: "rgba(59, 130, 246, 0.08)",
                                color: "#3b82f6",
                                fontSize: "10px",
                                fontWeight: 600
                            }}
                        >
                            DESCRIPTIONS
                        </span>
                    )}
                    {props.accordionSections && (
                        <span
                            style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                backgroundColor: "rgba(245, 158, 11, 0.08)",
                                color: "#f59e0b",
                                fontSize: "10px",
                                fontWeight: 600
                            }}
                        >
                            ACCORDION
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

export function getPreviewCss(): string {
    return "";
}
