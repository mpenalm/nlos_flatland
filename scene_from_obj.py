filename = 'singleLineBunny.obj'
shadername = 'shader.txt'
vboname = 'vbo.txt'
svgname = 'shape.svg'

import numpy as np

with open(filename, 'r') as f:
    text_lines = f.readlines()

vertices = []
obj_lines = []
for line in text_lines:
    words = line.split()
    if len(words) > 0:
        if words[0] == 'v':
            vertices.append([float(words[2]), float(words[3])])
        elif words[0] == 'l':
            obj_lines.append((int(words[1])-1, int(words[2])-1))
print(np.shape(vertices))
print(np.shape(obj_lines))

vertices = np.array(vertices)
rwall_pos = 1.2
vertices[:,0] = rwall_pos - vertices[:,0]
print(vertices.shape)

shaderstring = '''#include "trace-frag"

#include "bsdf"
#include "intersect"

void intersect(Ray ray, inout Intersection isect) {
    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 0.0, isect);
    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 1.0, isect);
'''

for line in obj_lines:
    shaderstring += f'    lineIntersect(ray, vec2({vertices[line[0]][0]}, {vertices[line[0]][1]}), vec2({vertices[line[1]][0]}, {vertices[line[1]][1]}), 1.0, isect);\n'

shaderstring += '''}

vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, inout vec3 throughput, out float tMult) {
    tMult = 1.0;
    if (isect.mat == 0.0) {
        throughput *= vec3(0.0);
        return sampleDiffuse(state, wiLocal);
    } else {
        throughput *= vec3(0.5);
        return sampleDiffuse(state, wiLocal);
    }
}
'''

with open(shadername, 'w+') as f:
    f.write(shaderstring)

num_vertices = 2 + 2 * len(obj_lines)  # num_segments = len(obj_lines); +1 relay wall
vbostring = f'''        // {filename}
        i++;
        this.sceneVBOs.push(new tgl.VertexBuffer());
        this.sceneVBOs[i].addAttribute("Position", 2, this.gl.FLOAT, false);
        this.sceneVBOs[i].init({num_vertices});
        vboData = new Float32Array({num_vertices} * 2);
        addRelayWallVertices(vboData, this.aspect);
'''

#vertices[line[0]][0]
j = 4
for line in obj_lines:
    vbostring += f'''        vboData[{j}] = {vertices[line[0]][0]} / this.aspect;
        vboData[{j + 1}] = {vertices[line[0]][1]};
        vboData[{j + 2}] = {vertices[line[1]][0]} / this.aspect;
        vboData[{j + 3}] = {vertices[line[1]][1]};
'''
    j += 4

vbostring += '        this.sceneVBOs[i].copy(vboData);'

with open(vboname, 'w+') as f:
    f.write(vbostring)


vertices[:,1] *= -1
vertices += np.array([0.5,1])
vertices *= 100

vertex_order = []
line = obj_lines[0]
vertex_order.append(line[0])
vertex_order.append(line[1])
# print(vertex_order)
# print(vertex_order[-1])
# print(line)
while len(vertex_order) < len(vertices):
    idx = np.where(np.array(obj_lines) == vertex_order[-1])
    if len(idx) != 2:
        print('Error: number of lines with the vertex is different from 2')
        exit()
    if obj_lines[idx[0][0]] == line:
        line = obj_lines[idx[0][1]]
        vertex_order.append(line[1-idx[1][1]])
    else:
        line = obj_lines[idx[0][0]]
        vertex_order.append(line[1-idx[1][0]])
    # print(line)
    # print(vertex_order)
    # exit()
print(len(set(vertex_order)) == len(vertex_order)) # Check unique elements
vertex_order.append(vertex_order[0])

svg_head = '''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->

<svg
   width="210mm"
   height="297mm"
   viewBox="0 0 210 297"
   version="1.1"
   id="svg2412"
   inkscape:version="1.2.2 (732a01da63, 2022-12-09)"
   sodipodi:docname="drawing.svg"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <sodipodi:namedview
     id="namedview2414"
     pagecolor="#ffffff"
     bordercolor="#666666"
     borderopacity="1.0"
     inkscape:showpageshadow="2"
     inkscape:pageopacity="0.0"
     inkscape:pagecheckerboard="0"
     inkscape:deskcolor="#d1d1d1"
     inkscape:document-units="mm"
     showgrid="false"
     inkscape:zoom="0.67526655"
     inkscape:cx="373.92641"
     inkscape:cy="562.00029"
     inkscape:window-width="958"
     inkscape:window-height="1008"
     inkscape:window-x="953"
     inkscape:window-y="0"
     inkscape:window-maximized="0"
     inkscape:current-layer="layer1" />
'''

svg_tail = '</svg>'

svg_body = '''  <g
     inkscape:label="Layer 1"
     inkscape:groupmode="layer"
     id="layer1">
'''
id = 1
for line in obj_lines:
    svg_body += f'''    <path
       style="fill:none;stroke:#000000;stroke-width:1pt;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       d="M {vertices[line[0]][0]},{vertices[line[0]][1]}  {vertices[line[1]][0]},{vertices[line[1]][1]}"
       id="path{id}" />
'''
    id += 1
svg_body += '''    <path
       style="fill:none;stroke:#000000;stroke-width:4px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       d="M'''
for v in vertex_order:
    svg_body += f' {vertices[v][0]},{vertices[v][1]}'
svg_body += f'''"
       id="path{id}" />
  </g>'''

with open(svgname, 'w+') as f:
    f.write(svg_head + svg_body + svg_tail)