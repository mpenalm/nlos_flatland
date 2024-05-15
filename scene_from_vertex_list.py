filename = 'bunny_vertices.txt'
shadername = 'shader.txt'
vboname = 'vbo.txt'
svgname = 'shape.svg'

import numpy as np

rwall_pos = 1.2
vertices = np.loadtxt(filename)
vertices[:,0] = rwall_pos - vertices[:,0]
print(vertices.shape)

shaderstring = '''#include "trace-frag"

#include "bsdf"
#include "intersect"

void intersect(Ray ray, inout Intersection isect) {
    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 0.0, isect);
    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 1.0, isect);
'''

for i in range(len(vertices)-1):
    shaderstring += f'    lineIntersect(ray, vec2({vertices[i][0]}, {vertices[i][1]}), vec2({vertices[i+1][0]}, {vertices[i+1][1]}), 1.0, isect);\n'

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

num_vertices = 2 * len(vertices)  # num_segments = len(vertices)-1; +1 relay wall
vbostring = f'''        // {filename}
        i++;
        this.sceneVBOs.push(new tgl.VertexBuffer());
        this.sceneVBOs[i].addAttribute("Position", 2, this.gl.FLOAT, false);
        this.sceneVBOs[i].init({num_vertices});
        vboData = new Float32Array({num_vertices} * 2);
        addRelayWallVertices(vboData, this.aspect);
'''

for j in range(len(vertices)-1):
    vbostring += f'''        vboData[{4*j + 4}] = {vertices[j][0]} / this.aspect;
        vboData[{4*j + 5}] = {vertices[j][1]};
        vboData[{4*j + 6}] = {vertices[j+1][0]} / this.aspect;
        vboData[{4*j + 7}] = {vertices[j+1][1]};
'''

vbostring += '        this.sceneVBOs[i].copy(vboData);'

with open(vboname, 'w+') as f:
    f.write(vbostring)


vertices[:,1] *= -1
vertices += np.array([0.5,1])
vertices *= 100
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
    <path
       style="fill:none;stroke:#000000;stroke-width:4px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       d="M'''
for j in range(len(vertices)):
    svg_body += f' {vertices[j][0]},{vertices[j][1]}'
svg_body += '''"
       id="path8573" />
  </g>
'''

with open(svgname, 'w+') as f:
    f.write(svg_head + svg_body + svg_tail)