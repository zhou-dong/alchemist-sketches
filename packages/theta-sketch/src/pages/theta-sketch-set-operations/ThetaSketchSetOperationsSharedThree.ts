import * as THREE from 'three';
import { axis, circle, latex, text } from 'obelus-three-render';
import { axisStyle, circleStyle, textStyle } from '@alchemist/theta-sketch/theme/obelusTheme';

export interface Position {
    x: number;
    y: number;
}

function makeRandomId() {
    return Math.random().toString(36).substring(2, 15);
}

export function buildAxis(start: Position, end: Position) {
    const randomId = makeRandomId();
    const axisLineId = `axis_line_${randomId}`;
    const axisLine = axis(axisLineId, start, end, { ...axisStyle, dotCount: 0 });
    return { axisLineId, axisLine };
}

export function buildDot(start: Position, end: Position, value: number, sizeScale: number) {
    const randomId = makeRandomId();
    const radius = 10;
    const lengthScale = end.x - start.x;
    const x = start.x + value * lengthScale;
    const y = start.y;
    const dotId = `dot_${randomId}_${value}`;
    const dot = circle(dotId, radius, { x, y }, circleStyle);

    (dot.target as THREE.Mesh).scale.set(sizeScale, sizeScale, sizeScale);
    return { dotId, dot, value };
}

export function buildNumber(start: Position, end: Position, value: number, size: number, index: number, scale: number) {
    const randomId = makeRandomId();
    const numberId = `number_${randomId}_${value}`;
    const totalLength = end.x - start.x;
    const x = start.x + index * (totalLength / (size - 1));
    const y = start.y - 30;
    const number = text(numberId, value.toFixed(2), { x, y }, { ...textStyle, fontSize: '16px' });
    (number.target as THREE.Mesh).scale.set(scale, scale, scale);
    return { numberId, number };
}

export function buildLatex(y: number, latexExpression: string, scale: number, fontSize = '14px') {
    const randomId = makeRandomId();
    const latexId = `latex_${randomId}`;
    const instance = latex(latexId, latexExpression, { x: 0, y: y + 30 }, { ...textStyle, fontSize });
    (instance.target as THREE.Mesh).scale.set(scale, scale, scale);
    return { latexId, latex: instance };
}

export const buildKmvInfoLatex = (title: string, y: number, k: number, theta: number, estimated: number, scale: number) => {
    const latexExpression = `\\begin{align*}
    \\text{ ${title} } \\quad | \\quad \\quad
    k = ${k}, \\quad \\theta = \\max(v_1,\\dots,v_k) = ${theta.toFixed(2)}, \\quad \\hat{N} = \\frac{k}{\\theta} - 1 = \\frac{${k}}{${theta.toFixed(2)}} - 1 = ${estimated.toFixed(2)}
    \\end{align*}
    `;
    return buildLatex(y, latexExpression, scale, '14px');
};
