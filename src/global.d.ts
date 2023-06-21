import {ModelViewerElement} from "@google/model-viewer";
import {DOMAttributes} from "react";

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any }>;
declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['model-viewer']: CustomElement<Omit<ModelViewerElement, "style"> | Pick<DOMAttributes<"div">["style"]>>;
        }
    }
}
