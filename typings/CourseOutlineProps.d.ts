/**
 * This file was generated from CourseOutline.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { DynamicValue, ListValue, ListActionValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export interface CourseOutlineContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    contentItems: ListValue;
    itemTitle: ListAttributeValue<string>;
    itemDescription?: ListAttributeValue<string>;
    itemContentType?: ListAttributeValue<string>;
    itemGroupName?: ListAttributeValue<string>;
    itemDuration?: ListAttributeValue<string>;
    itemStatus?: ListAttributeValue<string>;
    itemIsPreviewable?: ListAttributeValue<boolean>;
    itemSortOrder?: ListAttributeValue<Big>;
    activeItemId?: DynamicValue<string>;
    onItemClick?: ListActionValue;
    showSummaryBar: boolean;
    courseTitle?: DynamicValue<string>;
    showDuration: boolean;
    showContentTypeIcons: boolean;
    showNumbering: boolean;
    showProgress: boolean;
    showDescription: boolean;
    accordionSections: boolean;
    expandAllByDefault: boolean;
}

export interface CourseOutlinePreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    contentItems: {} | { caption: string } | { type: string } | null;
    itemTitle: string;
    itemDescription: string;
    itemContentType: string;
    itemGroupName: string;
    itemDuration: string;
    itemStatus: string;
    itemIsPreviewable: string;
    itemSortOrder: string;
    activeItemId: string;
    onItemClick: {} | null;
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
