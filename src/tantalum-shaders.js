var Shaders = {
    'blend-test-frag':
        '#include "preamble"\n\n'                                +

        'void main() {\n'                                        +
        '    gl_FragColor = vec4(vec3(7.0, 59.0, -7.0), 1.0);\n' +
        '}\n',

    'blend-test-pack-frag':
        '#include "preamble"\n\n'                                     +

        'uniform sampler2D Tex;\n\n'                                  +

        'void main() {\n'                                             +
        '    gl_FragColor = texture2D(Tex, vec2(0.5))*(1.0/255.0);\n' +
        '}\n',

    'blend-test-vert':
        '#include "preamble"\n\n'                  +

        'attribute vec3 Position;\n\n'             +

        'void main(void) {\n'                      +
        '    gl_Position = vec4(Position, 1.0);\n' +
        '}\n',

    'bp-conf-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform float tmax;\n\n'                                                          +

        'uniform sampler2D fluence; // x time, y spad\n\n'                                 +

        'uniform float numPixels;\n'                                                       +
        'uniform vec2 laserPos;\n'                                                         +
        'uniform vec2 spadPos;\n'                                                          +
        'uniform vec2 wallPos; // laser and spad grid\n\n'                                 +

        'uniform sampler2D planeGrid; // Plane to reconstruct\n'                           +
        '        // positions of the considered pixels, on a row\n\n'                      +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '    float x = floor(mPos.x * numPixels); // [0, numPixels)\n'                     +
        '    float y = floor(mPos.y * numPixels); // [0, numPixels)\n'                     +
        '    float pos = x + numPixels * (numPixels - 1.0 - y); // [0, numPixels^2-1)\n'   +
        '    pos = (pos + 0.5) / (numPixels * numPixels); // (0, 1)\n\n'                   +

        '    vec2 pixelPos = texture2D(planeGrid, vec2(pos, 0.5)).xy;\n'                   +
        '    float dlp = distance(wallPos, laserPos); // distance laser device to capture' +
                                                               'd (illuminated) point\n'   +
        '    float dsp = distance(wallPos, spadPos); // distance spad device to captured ' +
                                                                               'point\n'   +
        '    float ds  = distance(wallPos, pixelPos); // distance captured (illuminated) ' +
                                                        'point to reconstructed point\n'   +
        '    float dt = 2.0 * ds + dsp + dlp;\n\n'                                         +

        '    float t = dt / tmax;\n'                                                       +
        '    gl_FragColor = vec4(t, 0.0, 0.0, 1.0);\n'                                     +
        '    gl_FragColor = texture2D(fluence, vec2(t, mPos.y));\n'                        +
        '}\n',

    'bp-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform float tmax;\n\n'                                                          +

        'uniform sampler2D fluence; // x time, y spad\n\n'                                 +

        'uniform vec2 laserPos;\n'                                                         +
        'uniform vec2 laserGrid; // could be more than one, actually\n'                    +
        'uniform vec2 spadPos;\n'                                                          +
        'uniform sampler2D spadGrid;\n\n'                                                  +

        'uniform sampler2D planeGrid; // Plane to reconstruct\n'                           +
        '        // positions of the considered pixels, on a row\n\n'                      +

        'varying vec2 mPos; // Pixel coordinates [0,1]; x = time, y = spad\n\n'            +

        'void main() {\n'                                                                  +
        '    vec2 pixelPos = texture2D(planeGrid, vec2(mPos.x, 0.5)).xy;\n'                +
        '    vec2 wallSpad = texture2D(spadGrid, vec2(mPos.y, 0.5)).xy;\n'                 +
        '    float dlp = distance(laserGrid, laserPos);\n'                                 +
        '    float dl  = distance(laserGrid, pixelPos);\n'                                 +
        '    float dsp = distance(wallSpad, spadPos); // distance spad device to captured' +
                                                                             ' points\n'   +
        '    float ds  = distance(wallSpad, pixelPos);\n'                                  +
        '    float dt = ds + dsp + dl + dlp;\n\n'                                          +

        '    float t = dt / tmax;\n'                                                       +
        '    gl_FragColor = texture2D(fluence, vec2(t, mPos.y));\n'                        +
        '}\n',

    'bp-sum-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D fluence; // x time, y spad\n\n'                                 +

        'uniform float numPixels;\n\n'                                                     +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'const int numSpads = {numSpads};\n\n'                                             +

        'void main() {\n'                                                                  +
        '    float x = floor(mPos.x * numPixels);\n'                                       +
        '    float y = floor(mPos.y * numPixels);\n'                                       +
        '    float pos = x + numPixels * (numPixels - 1.0 - y);\n'                         +
        '    pos = (pos + 0.5) / (numPixels * numPixels);\n\n'                             +

        '    float spadDist = 1.0 / float(numSpads);\n\n'                                  +

        '    vec2 fluenceAccum = vec2(0.0);\n'                                             +
        '    for (int i = 0; i < numSpads; i++) {\n'                                       +
        '        fluenceAccum += texture2D(fluence, vec2(pos, spadDist * (float(i) + 0.5)' +
                                                                              ')).xy;\n'   +
        '    }\n\n'                                                                        +

        '    gl_FragColor = vec4(fluenceAccum, 0.0, 1.0);\n'                               +
        '}\n',

    'bp-vert':
        '#include "preamble"\n\n'                       +

        'attribute vec2 Position;\n\n'                  +

        'varying vec2 mPos;\n\n'                        +

        'void main() {\n'                               +
        '    gl_Position = vec4(Position, 1.0, 1.0);\n' +
        '    mPos = Position/2.0+vec2(0.5);\n'          +
        '}\n',

    'bsdf':
        'float sellmeierIor(vec3 b, vec3 c, float lambda) {\n'                             +
        '    float lSq = (lambda*1e-3)*(lambda*1e-3);\n'                                   +
        '    return 1.0 + dot((b*lSq)/(lSq - c), vec3(1.0));\n'                            +
        '}\n\n'                                                                            +

        'float tanh(float x) {\n'                                                          +
        '    if (abs(x) > 10.0) /* Prevent nasty overflow problems */\n'                   +
        '        return sign(x);\n'                                                        +
        '    float e = exp(-2.0*x);\n'                                                     +
        '    return (1.0 - e)/(1.0 + e);\n'                                                +
        '}\n'                                                                              +
        'float atanh(float x) {\n'                                                         +
        '    return 0.5*log((1.0 + x)/(1.0 - x));\n'                                       +
        '}\n\n'                                                                            +

        'float dielectricReflectance(float eta, float cosThetaI, out float cosThetaT) {\n' +
        '    float sinThetaTSq = eta*eta*(1.0 - cosThetaI*cosThetaI);\n'                   +
        '    if (sinThetaTSq > 1.0) {\n'                                                   +
        '        cosThetaT = 0.0;\n'                                                       +
        '        return 1.0;\n'                                                            +
        '    }\n'                                                                          +
        '    cosThetaT = sqrt(1.0 - sinThetaTSq);\n\n'                                     +

        '    float Rs = (eta*cosThetaI - cosThetaT)/(eta*cosThetaI + cosThetaT);\n'        +
        '    float Rp = (eta*cosThetaT - cosThetaI)/(eta*cosThetaT + cosThetaI);\n\n'      +

        '    return (Rs*Rs + Rp*Rp)*0.5;\n'                                                +
        '}\n\n'                                                                            +

        'vec2 sampleDiffuse(inout vec4 state, vec2 wi) {\n'                                +
        '    float x = rand(state)*2.0 - 1.0;\n'                                           +
        '    float y = sqrt(1.0 - x*x);\n'                                                 +
        '    return vec2(x, y*sign(wi.y));\n'                                              +
        '}\n'                                                                              +
        'vec2 sampleMirror(vec2 wi) {\n'                                                   +
        '    return vec2(-wi.x, wi.y);\n'                                                  +
        '}\n'                                                                              +
        'vec2 sampleDielectric(inout vec4 state, vec2 wi, float ior) {\n'                  +
        '    float cosThetaT;\n'                                                           +
        '    float eta = wi.y < 0.0 ? ior : 1.0/ior;\n'                                    +
        '    float Fr = dielectricReflectance(eta, abs(wi.y), cosThetaT);\n'               +
        '    if (rand(state) < Fr)\n'                                                      +
        '        return vec2(-wi.x, wi.y);\n'                                              +
        '    else\n'                                                                       +
        '        return vec2(-wi.x*eta, -cosThetaT*sign(wi.y));\n'                         +
        '}\n\n'                                                                            +

        'float sampleVisibleNormal(float sigma, float xi, float theta0, float theta1) {\n' +
        '    float sigmaSq = sigma*sigma;\n'                                               +
        '    float invSigmaSq = 1.0/sigmaSq;\n\n'                                          +

        '    float cdf0 = tanh(theta0*0.5*invSigmaSq);\n'                                  +
        '    float cdf1 = tanh(theta1*0.5*invSigmaSq);\n\n'                                +

        '    return 2.0*sigmaSq*atanh(cdf0 + (cdf1 - cdf0)*xi);\n'                         +
        '}\n'                                                                              +
        'vec2 sampleRoughMirror(inout vec4 state, vec2 wi, inout vec3 throughput, float s' +
                                                                             'igma) {\n'   +
        '    float theta = asin(clamp(wi.x, -1.0, 1.0));\n'                                +
        '    float theta0 = max(theta - PI_HALF, -PI_HALF);\n'                             +
        '    float theta1 = min(theta + PI_HALF,  PI_HALF);\n\n'                           +

        '    float thetaM = sampleVisibleNormal(sigma, rand(state), theta0, theta1);\n'    +
        '    vec2 m = vec2(sin(thetaM), cos(thetaM));\n'                                   +
        '    vec2 wo = m*(dot(wi, m)*2.0) - wi;\n'                                         +
        '    if (wo.y < 0.0)\n'                                                            +
        '        throughput = vec3(0.0);\n'                                                +
        '    return wo;\n'                                                                 +
        '}\n'                                                                              +
        'vec2 sampleRoughDielectric(inout vec4 state, vec2 wi, float sigma, float ior, ou' +
                                                                     't float wiDotN)\n'   +
        '{\n'                                                                              +
        '    float theta = asin(min(abs(wi.x), 1.0));\n'                                   +
        '    float theta0 = max(theta - PI_HALF, -PI_HALF);\n'                             +
        '    float theta1 = min(theta + PI_HALF,  PI_HALF);\n\n'                           +

        '    float thetaM = sampleVisibleNormal(sigma, rand(state), theta0, theta1);\n'    +
        '    vec2 m = vec2(sin(thetaM), cos(thetaM));\n\n'                                 +

        '    float wiDotM = dot(wi, m);\n'                                                 +
        '    wiDotN = wiDotM;\n\n'                                                         +

        '    float cosThetaT;\n'                                                           +
        '    float etaM = wiDotM < 0.0 ? ior : 1.0/ior;\n'                                 +
        '    float F = dielectricReflectance(etaM, abs(wiDotM), cosThetaT);\n'             +
        '    if (wiDotM < 0.0)\n'                                                          +
        '        cosThetaT = -cosThetaT;\n\n'                                              +

        '    if (rand(state) < F)\n'                                                       +
        '        return 2.0*wiDotM*m - wi;\n'                                              +
        '    else\n'                                                                       +
        '        return (etaM*wiDotM - cosThetaT)*m - etaM*wi;\n'                          +
        '}\n',

    'compose-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D Frame;\n'                                                       +
        'uniform float Exposure;\n\n'                                                      +

        'varying vec2 vTexCoord;\n\n'                                                      +

        'void main() {\n'                                                                  +
        '    gl_FragColor = vec4(pow(texture2D(Frame, vTexCoord).rgb*Exposure, vec3(1.0/2' +
                                                                         '.2)), 1.0);\n'   +
        '    //gl_FragColor = vec4(texture2D(Frame, vTexCoord).rgb, 1.0);\n'               +
        '}\n',

    'compose-vert':
        '#include "preamble"\n\n'                  +

        'attribute vec3 Position;\n'               +
        'attribute vec2 TexCoord;\n'               +
        'uniform sampler2D RgbData;\n\n'           +

        'varying vec2 vTexCoord;\n\n'              +

        'void main(void) {\n'                      +
        '    gl_Position = vec4(Position, 1.0);\n' +
        '    vTexCoord = TexCoord;\n'              +
        '}\n',

    'csg-intersect':
        'struct Segment {\n'                                                                +
        '    float tNear, tFar;\n'                                                          +
        '    vec2  nNear, nFar;\n'                                                          +
        '};\n\n'                                                                            +

        'Segment segmentIntersection(Segment a, Segment b) {\n'                             +
        '    return Segment(\n'                                                             +
        '        max(a.tNear, b.tNear),\n'                                                  +
        '        min(a.tFar,  b.tFar),\n'                                                   +
        '        (a.tNear > b.tNear) ? a.nNear : b.nNear,\n'                                +
        '        (a.tFar  < b.tFar)  ? a.nFar  : b.nFar\n'                                  +
        '    );\n'                                                                          +
        '}\n'                                                                               +
        'Segment segmentSubtraction(Segment a, Segment b, float tMin) {\n'                  +
        '    if (a.tNear >= a.tFar || b.tNear >= b.tFar || a.tFar <= b.tNear || a.tNear >'  +
                                                                           '= b.tFar)\n'    +
        '        return a;\n\n'                                                             +

        '    Segment s1 = Segment(a.tNear, b.tNear, a.nNear, -b.nNear);\n'                  +
        '    Segment s2 = Segment(b.tFar,  a.tFar, -b.nFar,   a.nFar);\n'                   +
        '    bool valid1 = s1.tNear <= s1.tFar;\n'                                          +
        '    bool valid2 = s2.tNear <= s2.tFar;\n\n'                                        +

        '    if (valid1 && valid2) {\n'                                                     +
        '        if (s1.tFar >= tMin) return s1; else return s2;\n'                         +
        '    } else {\n'                                                                    +
        '        if (valid1) return s1; else return s2;\n'                                  +
        '    }\n'                                                                           +
        '}\n'                                                                               +
        'void segmentCollapse(Segment segment, float matId, inout Intersection isect) {\n'  +
        '    segment.tNear = max(segment.tNear, isect.tMin);\n'                             +
        '    segment.tFar  = min(segment.tFar,  isect.tMax);\n\n'                           +

        '    if (segment.tNear <= segment.tFar) {\n'                                        +
        '        if (segment.tNear > isect.tMin) {\n'                                       +
        '            isect.tMax = segment.tNear;\n'                                         +
        '            isect.n = segment.nNear;\n'                                            +
        '            isect.mat = matId;\n'                                                  +
        '        } else if (segment.tFar < isect.tMax) {\n'                                 +
        '            isect.tMax = segment.tFar;\n'                                          +
        '            isect.n = segment.nFar;\n'                                             +
        '            isect.mat = matId;\n'                                                  +
        '        }\n'                                                                       +
        '    }\n'                                                                           +
        '}\n\n'                                                                             +

        'Segment horzSpanIntersect(Ray ray, float y, float radius) {\n'                     +
        '    float dc = (y - ray.pos.y)*ray.invDir.y;\n'                                    +
        '    float dt = ray.dirSign.y*radius*ray.invDir.y;\n'                               +
        '    return Segment(dc - dt, dc + dt, vec2(0.0, -ray.dirSign.y), vec2(0.0, ray.di'  +
                                                                          'rSign.y));\n'    +
        '}\n'                                                                               +
        'Segment vertSpanIntersect(Ray ray, float x, float radius) {\n'                     +
        '    float dc = (x - ray.pos.x)*ray.invDir.x;\n'                                    +
        '    float dt = ray.dirSign.x*radius*ray.invDir.x;\n'                               +
        '    return Segment(dc - dt, dc + dt, vec2(-ray.dirSign.x, 0.0), vec2(ray.dirSign'  +
                                                                          '.x, 0.0));\n'    +
        '}\n'                                                                               +
        'Segment boxSegmentIntersect(Ray ray, vec2 center, vec2 radius) {\n'                +
        '    return segmentIntersection(\n'                                                 +
        '        horzSpanIntersect(ray, center.y, radius.y),\n'                             +
        '        vertSpanIntersect(ray, center.x, radius.x)\n'                              +
        '    );\n'                                                                          +
        '}\n'                                                                               +
        'Segment sphereSegmentIntersect(Ray ray, vec2 center, float radius) {\n'            +
        '    Segment result;\n\n'                                                           +

        '    vec2 p = ray.pos - center;\n'                                                  +
        '    float B = dot(p, ray.dir);\n'                                                  +
        '    float C = dot(p, p) - radius*radius;\n'                                        +
        '    float detSq = B*B - C;\n'                                                      +
        '    if (detSq >= 0.0) {\n'                                                         +
        '        float det = sqrt(detSq);\n'                                                +
        '        result.tNear = -B - det;\n'                                                +
        '        result.tFar  = -B + det;\n'                                                +
        '        result.nNear = (p + ray.dir*result.tNear)*(1.0/radius);\n'                 +
        '        result.nFar  = (p + ray.dir*result.tFar)*(1.0/radius);\n'                  +
        '    } else {\n'                                                                    +
        '        result.tNear =  1e30;\n'                                                   +
        '        result.tFar  = -1e30;\n'                                                   +
        '    }\n\n'                                                                         +

        '    return result;\n'                                                              +
        '}\n\n'                                                                             +

        'void biconvexLensIntersect(Ray ray, vec2 center, float h, float d, float r1, flo'  +
                                     'at r2, float matId, inout Intersection isect) {\n'    +
        '    segmentCollapse(segmentIntersection(segmentIntersection(\n'                    +
        '        horzSpanIntersect(ray, center.y, h),\n'                                    +
        '        sphereSegmentIntersect(ray, center + vec2(r1 - d, 0.0), r1)),\n'           +
        '        sphereSegmentIntersect(ray, center - vec2(r2 - d, 0.0), r2)\n'             +
        '    ), matId, isect);\n'                                                           +
        '}\n'                                                                               +
        'void biconcaveLensIntersect(Ray ray, vec2 center, float h, float d, float r1, fl'  +
                                    'oat r2, float matId, inout Intersection isect) {\n'    +
        '    segmentCollapse(segmentSubtraction(segmentSubtraction(segmentIntersection(\n'  +
        '        horzSpanIntersect(ray, center.y, h),\n'                                    +
        '        vertSpanIntersect(ray, center.x + 0.5*(r2 - r1), 0.5*(abs(r1) + abs(r2))'  +
                                                                             ' + d)),\n'    +
        '        sphereSegmentIntersect(ray, center + vec2(r2 + d, 0.0), r2), isect.tMin)'  +
                                                                                   ',\n'    +
        '        sphereSegmentIntersect(ray, center - vec2(r1 + d, 0.0), r1), isect.tMin\n' +
        '    ), matId, isect);\n'                                                           +
        '}\n'                                                                               +
        'void meniscusLensIntersect(Ray ray, vec2 center, float h, float d, float r1, flo'  +
                                     'at r2, float matId, inout Intersection isect) {\n'    +
        '    segmentCollapse(segmentSubtraction(segmentIntersection(segmentIntersection(\n' +
        '        horzSpanIntersect(ray, center.y, h),\n'                                    +
        '        vertSpanIntersect(ray, center.x + 0.5*r2, 0.5*abs(r2) + d)),\n'            +
        '        sphereSegmentIntersect(ray, center + vec2(r1 - sign(r1)*d, 0.0), abs(r1)'  +
                                                                                 ')),\n'    +
        '        sphereSegmentIntersect(ray, center + vec2(r2 + sign(r2)*d, 0.0), abs(r2)'  +
                                                                       '), isect.tMin\n'    +
        '    ), matId, isect);\n'                                                           +
        '}\n'                                                                               +
        'void planoConvexLensIntersect(Ray ray, vec2 center, float h, float d, float r, f'  +
                                             'loat matId, inout Intersection isect) {\n'    +
        '    segmentCollapse(segmentIntersection(\n'                                        +
        '        boxSegmentIntersect(ray, center, vec2(d, h)),\n'                           +
        '        sphereSegmentIntersect(ray, center + vec2(r - d, 0.0), abs(r))\n'          +
        '    ), matId, isect);\n'                                                           +
        '}\n'                                                                               +
        'void planoConcaveLensIntersect(Ray ray, vec2 center, float h, float d, float r, '  +
                                            'float matId, inout Intersection isect) {\n'    +
        '    segmentCollapse(segmentSubtraction(segmentIntersection(\n'                     +
        '        horzSpanIntersect(ray, center.y, h),\n'                                    +
        '        vertSpanIntersect(ray, center.x - 0.5*r, 0.5*abs(r) + d)),\n'              +
        '        sphereSegmentIntersect(ray, center - vec2(r + d, 0.0), abs(r)), isect.tM'  +
                                                                                  'in\n'    +
        '    ), matId, isect);\n'                                                           +
        '}\n',

    'gauss-frag':
        '// https://fiveko.com/gaussian-filter-in-opengl-webgl/\n\n'                       +

        '#include "preamble"\n\n'                                                          +

        '// our texture\n'                                                                 +
        'uniform sampler2D u_image;\n\n'                                                   +

        '#define KERNEL_SIZE 15\n'                                                         +
        'uniform vec2 u_textureSize;\n'                                                    +
        'uniform int u_direction;\n'                                                       +
        'uniform float u_kernel[KERNEL_SIZE];\n\n'                                         +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '	// vec2 textCoord = gl_FragCoord.xy / u_textureSize;\n'                          +
        '	vec2 onePixel = ((u_direction == 0) ? vec2(1.0, 0.0) : vec2(0.0, 1.0)) / u_text' +
                                                                            'ureSize;\n'   +
        '	vec4 meanColor = vec4(0);\n'                                                     +
        '	int ms = KERNEL_SIZE / 2;\n'                                                     +
        '	for (int i = 0; i < KERNEL_SIZE; i++) {\n'                                       +
        '		// meanColor += texture2D(u_image, textCoord  + onePixel*vec2(i - ms))*u_kerne' +
                                                                               'l[i];\n'   +
        '		vec2 coord = mPos + onePixel*vec2(i - ms);\n'                                   +
        '		bool inx = coord.x > 0.0 && coord.x < 1.0;\n'                                   +
        '		bool iny = coord.y > 0.0 && coord.y < 1.0;\n'                                   +
        '		meanColor += texture2D(u_image, coord)*u_kernel[i] * vec4(inx && iny);\n'       +
        '	}\n'                                                                             +
        '	gl_FragColor = meanColor;\n'                                                     +
        '}\n',

    'h-conf-vert':
        '#include "preamble"\n\n'                                                           +

        'uniform sampler2D PosDataA;\n'                                                     +
        'uniform sampler2D PosDataB;\n'                                                     +
        'uniform sampler2D RgbData;\n'                                                      +
        'uniform sampler2D TimeDataA;\n\n'                                                  +

        'uniform float tmax;\n'                                                             +
        'uniform float spadRadius;\n'                                                       +
        'uniform vec2 spadPos;    // Position of the physical spad device\n'                +
        'uniform vec2 SpadGrid;   // Position scanned by device and illuminated by laser\n' +
        'uniform vec2 SpadNormal;\n\n'                                                      +

        'attribute vec2 TexCoord;\n\n'                                                      +

        'varying vec3 vColor;\n\n'                                                          +

        'void main() {\n'                                                                   +
        '    gl_Position = vec4(vec3(-1.0), 1.0);\n\n'                                      +

        '    vec2 posA = texture2D(PosDataA, TexCoord.xy).xy;\n'                            +
        '    vec2 posB = texture2D(PosDataB, TexCoord.xy).xy;\n'                            +
        '    vec2 dir = posB - posA;\n'                                                     +
        '    float t0 = texture2D(TimeDataA, TexCoord.xy).x;\n'                             +
        '    float biasCorrection = clamp(length(dir)/max(abs(dir.x), abs(dir.y)), 1.0, 1'  +
                                                                           '.414214);\n\n'  +

        '    if (distance(posA, SpadGrid) <= spadRadius) {\n'                               +
        '        float t = t0 + distance(posA, spadPos); // Time needed to reach the sens'  +
                                               'or, assuming vacuum and no occlusions\n'    +
        '        float x = t / tmax * 2.0 - 1.0;\n\n'                                       +

        '        vec2 dir = spadPos - posA;\n'                                              +
        '        float cosine = dot(SpadNormal, dir);\n\n'                                  +

        '        gl_PointSize = 1.0;\n'                                                     +
        '        gl_Position = vec4(x, 0.0, 0.0, 1.0);\n'                                   +
        '        vColor = max(vec3(0.0), cosine * texture2D(RgbData, TexCoord.xy).rgb*bia'  +
                                      'sCorrection / vec3(spadRadius*spadRadius*PI));\n'    +
        '    }\n'                                                                           +
        '}\n',

    'h-frag':
        '#include "preamble"\n\n'                                                   +

        'varying vec3 vColor;\n\n'                                                  +

        'void main() {\n'                                                           +
        '    gl_FragColor = vec4((vColor.r+vColor.g+vColor.b)/3.0,0.0,0.0, 1.0);\n' +
        '}\n',

    'h-vert':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D PosDataA;\n'                                                    +
        'uniform sampler2D PosDataB;\n'                                                    +
        'uniform sampler2D RgbData;\n'                                                     +
        'uniform sampler2D TimeDataA;\n'                                                   +
        'uniform sampler2D SpadGrid;\n'                                                    +
        'uniform sampler2D SpadNormals;\n\n'                                               +

        'uniform float tmax;\n'                                                            +
        'uniform float spadRadius;\n'                                                      +
        'uniform vec2 spadPos;    // Position of the physical spad device\n\n'             +

        'attribute vec2 TexCoord;\n\n'                                                     +

        'varying vec3 vColor;\n\n'                                                         +

        'const int numSpads = {numSpads};\n\n'                                             +

        'void main() {\n'                                                                  +
        '    gl_Position = vec4(vec3(-1.0), 1.0);\n\n'                                     +

        '    vec2 posA = texture2D(PosDataA, TexCoord.xy).xy;\n'                           +
        '    vec2 posB = texture2D(PosDataB, TexCoord.xy).xy;\n'                           +
        '    vec2 dir = posB - posA;\n'                                                    +
        '    float t0 = texture2D(TimeDataA, TexCoord.xy).x;\n'                            +
        '    float biasCorrection = clamp(length(dir)/max(abs(dir.x), abs(dir.y)), 1.0, 1' +
                                                                           '.414214);\n\n' +

        '    vec2 spadPoint;\n'                                                            +
        '    for (int i = 0; i < numSpads; i++) {\n'                                       +
        '        float y = (float(i) + 0.5) / float(numSpads);\n'                          +
        '        spadPoint = texture2D(SpadGrid, vec2(y, 0.5)).xy;\n\n'                    +

        '        if (distance(posA, spadPoint) <= spadRadius) {\n'                         +
        '            float t = t0 + distance(posA, spadPos); // Time needed to reach the ' +
                                           'sensor, assuming vacuum and no occlusions\n'   +
        '            float x = t / tmax * 2.0 - 1.0;\n'                                    +
        '            y = 2.0 * y - 1.0;\n\n'                                               +

        '            vec2 n = texture2D(SpadNormals, vec2(y, 0.5)).xy;\n'                  +
        '            //n = vec2(-1.0, 0.0);\n'                                             +
        '            vec2 dir = spadPos - posA;\n'                                         +
        '            float cosine = dot(n, dir);\n\n'                                      +

        '            gl_PointSize = 1.0;\n'                                                +
        '            gl_Position = vec4(x, y, 0.0, 1.0);\n'                                +
        '            vColor = max(vec3(0.0), cosine * texture2D(RgbData, TexCoord.xy).rgb' +
                                  '*biasCorrection / vec3(spadRadius*spadRadius*PI));\n'   +
        '            break;\n'                                                             +
        '        }\n'                                                                      +
        '    }\n'                                                                          +
        '}\n',

    'init-frag':
        '#extension GL_EXT_draw_buffers : require\n'                                       +
        '#include "preamble"\n\n'                                                          +

        '#include "rand"\n\n'                                                              +

        'uniform sampler2D RngData;\n'                                                     +
        'uniform sampler2D Spectrum;\n'                                                    +
        'uniform sampler2D Emission;\n'                                                    +
        'uniform sampler2D ICDF;\n'                                                        +
        'uniform sampler2D PDF;\n'                                                         +
        'uniform vec2 EmitterPos;\n'                                                       +
        'uniform vec2 EmitterDir;\n'                                                       +
        'uniform float EmitterPower;\n'                                                    +
        'uniform float SpatialSpread;\n'                                                   +
        'uniform vec2 AngularSpread;\n\n'                                                  +

        'varying vec2 vTexCoord;\n\n'                                                      +

        'void main() {\n'                                                                  +
        '    vec4 state = texture2D(RngData, vTexCoord);\n\n'                              +

        '    float theta = AngularSpread.x + (rand(state) - 0.5)*AngularSpread.y;\n'       +
        '    vec2 dir = vec2(cos(theta), sin(theta));\n'                                   +
        '    vec2 pos = EmitterPos + (rand(state) - 0.5)*SpatialSpread*vec2(-EmitterDir.y' +
                                                                    ', EmitterDir.x);\n\n' +

        '    float randL = rand(state);\n'                                                 +
        '    float spectrumOffset = texture2D(ICDF, vec2(randL, 0.5)).r + rand(state)*(1.' +
                                                                           '0/256.0);\n'   +
        '    float lambda = 360.0 + (750.0 - 360.0)*spectrumOffset;\n'                     +
        '    vec3 rgb = EmitterPower\n'                                                    +
        '                    *texture2D(Emission, vec2(spectrumOffset, 0.5)).r\n'          +
        '                    *texture2D(Spectrum, vec2(spectrumOffset, 0.5)).rgb\n'        +
        '                    /texture2D(PDF,      vec2(spectrumOffset, 0.5)).r;\n\n'       +

        '    gl_FragData[0] = vec4(pos, dir);\n'                                           +
        '    gl_FragData[1] = state;\n'                                                    +
        '    gl_FragData[2] = vec4(rgb, lambda);\n'                                        +
        '}\n',

    'init-vert':
        '#include "preamble"\n\n'                  +

        'attribute vec3 Position;\n'               +
        'attribute vec2 TexCoord;\n\n'             +

        'varying vec2 vTexCoord;\n\n'              +

        'void main() {\n'                          +
        '    gl_Position = vec4(Position, 1.0);\n' +
        '    vTexCoord = TexCoord;\n'              +
        '}\n',

    'intersect':
        'void bboxIntersect(Ray ray, vec2 center, vec2 radius, float matId, inout Interse' +
                                                                      'ction isect) {\n'   +
        '    vec2 pos = ray.pos - center;\n'                                               +
        '    float tx1 = (-radius.x - pos.x)*ray.invDir.x;\n'                              +
        '    float tx2 = ( radius.x - pos.x)*ray.invDir.x;\n'                              +
        '    float ty1 = (-radius.y - pos.y)*ray.invDir.y;\n'                              +
        '    float ty2 = ( radius.y - pos.y)*ray.invDir.y;\n\n'                            +

        '    float minX = min(tx1, tx2), maxX = max(tx1, tx2);\n'                          +
        '    float minY = min(ty1, ty2), maxY = max(ty1, ty2);\n\n'                        +

        '    float tmin = max(isect.tMin, max(minX, minY));\n'                             +
        '    float tmax = min(isect.tMax, min(maxX, maxY));\n\n'                           +

        '    if (tmax >= tmin) {\n'                                                        +
        '        isect.tMax = (tmin == isect.tMin) ? tmax : tmin;\n'                       +
        '        isect.n = isect.tMax == tx1 ? vec2(-1.0, 0.0) : isect.tMax == tx2 ? vec2' +
                                                                        '(1.0, 0.0) :\n'   +
        '                  isect.tMax == ty1 ? vec2( 0.0, 1.0) :                     vec2' +
                                                                         '(0.0, 1.0);\n'   +
        '        isect.mat = matId;\n'                                                     +
        '    }\n'                                                                          +
        '}\n'                                                                              +
        'void sphereIntersect(Ray ray, vec2 center, float radius, float matId, inout Inte' +
                                                                   'rsection isect) {\n'   +
        '    vec2 p = ray.pos - center;\n'                                                 +
        '    float B = dot(p, ray.dir);\n'                                                 +
        '    float C = dot(p, p) - radius*radius;\n'                                       +
        '    float detSq = B*B - C;\n'                                                     +
        '    if (detSq >= 0.0) {\n'                                                        +
        '        float det = sqrt(detSq);\n'                                               +
        '        float t = -B - det;\n'                                                    +
        '        if (t <= isect.tMin || t >= isect.tMax)\n'                                +
        '            t = -B + det;\n'                                                      +
        '        if (t > isect.tMin && t < isect.tMax) {\n'                                +
        '            isect.tMax = t;\n'                                                    +
        '            isect.n = normalize(p + ray.dir*t);\n'                                +
        '            isect.mat = matId;\n'                                                 +
        '        }\n'                                                                      +
        '    }\n'                                                                          +
        '}\n'                                                                              +
        'void lineIntersect(Ray ray, vec2 a, vec2 b, float matId, inout Intersection isec' +
                                                                                't) {\n'   +
        '    vec2 sT = b - a;\n'                                                           +
        '    vec2 sN = vec2(-sT.y, sT.x);\n'                                               +
        '    float t = dot(sN, a - ray.pos)/dot(sN, ray.dir);\n'                           +
        '    float u = dot(sT, ray.pos + ray.dir*t - a);\n'                                +
        '    if (t < isect.tMin || t >= isect.tMax || u < 0.0 || u > dot(sT, sT))\n'       +
        '        return;\n\n'                                                              +

        '    isect.tMax = t;\n'                                                            +
        '    isect.n = normalize(sN);\n'                                                   +
        '    isect.mat = matId;\n'                                                         +
        '}\n'                                                                              +
        'void prismIntersect(Ray ray, vec2 center, float radius, float matId, inout Inter' +
                                                                    'section isect) {\n'   +
        '    lineIntersect(ray, center + vec2(   0.0,  1.0)*radius, center + vec2( 0.866,' +
                                                       ' -0.5)*radius, matId, isect);\n'   +
        '    lineIntersect(ray, center + vec2( 0.866, -0.5)*radius, center + vec2(-0.866,' +
                                                       ' -0.5)*radius, matId, isect);\n'   +
        '    lineIntersect(ray, center + vec2(-0.866, -0.5)*radius, center + vec2(   0.0,' +
                                                       '  1.0)*radius, matId, isect);\n'   +
        '}\n',

    'lap-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D fluence;\n'                                                     +
        'uniform float Aspect;\n\n'                                                        +

        'uniform float numPixels;\n\n'                                                     +

        'const int kernelWidth = 3;\n'                                                     +
        'uniform float kernel[kernelWidth*kernelWidth];\n\n'                               +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '    if (mPos.x > 1.0) {\n'                                                        +
        '        gl_FragColor = vec4(vec3(0.0), 1.0);\n'                                   +
        '    } else {\n\n'                                                                 +

        '        float acc = 0.0;\n'                                                       +
        '        vec2 ps = vec2(1.0 / numPixels);\n'                                       +
        '        vec2 kps = vec2(Aspect / float(kernelWidth), 1.0 / float(kernelWidth)); ' +
                                                                '// kernel pixel size\n\n' +

        '        for (int i = 0; i < kernelWidth*kernelWidth; i++){\n'                     +
        '            vec2 d = -vec2(kernelWidth / 2);\n'                                   +
        '            d.x += (i == 0 || i == 3 || i == 6) ? 0.0 : (i == 1 || i == 4 || i =' +
                                                                   '= 7) ? 1.0 : 2.0;\n'   +
        '            d.y += float(i / kernelWidth);\n'                                     +
        '            vec2 posTex = mPos + d * ps;\n'                                       +
        '            acc += kernel[i] * texture2D(fluence, posTex).x * float(posTex.x >= ' +
                      '0.0 && posTex.x <= 1.0 && posTex.y >= 0.0 && posTex.y <= 1.0);\n'   +
        '        }\n\n'                                                                    +

        '        gl_FragColor = vec4(acc, 0.0, 0.0, 1.0);\n'                               +
        '    }\n'                                                                          +
        '}\n',

    'log-frag':
        '#include "preamble"\n\n'                                                          +

        '// our texture\n'                                                                 +
        'uniform sampler2D u_image;\n\n'                                                   +

        '#define KERNEL_SIZE 45\n'                                                         +
        'uniform vec2 u_textureSize;\n'                                                    +
        '//uniform float u_kernel[KERNEL_SIZE*KERNEL_SIZE];\n'                             +
        'uniform sampler2D u_kernel;\n\n'                                                  +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '	// vec2 textCoord = gl_FragCoord.xy / u_textureSize;\n'                          +
        '	vec2 vertPixel = vec2(1.0, 0.0) / u_textureSize;\n'                              +
        '	vec2 horPixel  = vec2(0.0, 1.0) / u_textureSize;\n'                              +
        '	vec2 kernVertPixel = vec2(1.0, 0.0) / float(KERNEL_SIZE);\n'                     +
        '	vec2 kernHorPixel  = vec2(0.0, 1.0) / float(KERNEL_SIZE);\n\n'                   +

        '	vec4 meanColor = vec4(0);\n'                                                     +
        '	int ms = KERNEL_SIZE / 2;\n'                                                     +
        '	for (int i = 0; i < KERNEL_SIZE; i++) {\n'                                       +
        '		for (int j = 0; j < KERNEL_SIZE; j++) {\n'                                      +
        '			vec2 texPos = mPos + horPixel*vec2(i - ms) + vertPixel*vec2(j - ms);\n'        +
        '			//meanColor += texture2D(u_image, mPos + horPixel*vec2(i - ms) + vertPixel*ve' +
                                              'c2(j - ms))*u_kernel[i*KERNEL_SIZE+j];\n'   +
        '			meanColor += texture2D(u_image, texPos) *\n'                                   +
        '				texture2D(u_kernel, kernHorPixel*vec2(i) + kernVertPixel*vec2(j)).x *\n'      +
        '				vec4(texPos.x >= 0.0 && texPos.x <= 1.0 && texPos.y >= 0.0 && texPos.y <= 1.' +
                                           '0); // outside pixels have invalid values\n'   +
        '		}\n'                                                                            +
        '	}\n'                                                                             +
        '	gl_FragColor = abs(meanColor);\n'                                                +
        '}\n',

    'max-frag':
        '#include "preamble"\n\n'                                                           +

        '// Inspired from https://github.com/regl-project/regl/blob/gh-pages/example/redu'  +
                                                                            'ction.js\n\n'  +

        'uniform sampler2D tex;\n'                                                          +
        'uniform int useSameChannel;\n'                                                     +
        'uniform int isComplex;\n'                                                          +
        'uniform int numPixels;\n'                                                          +
        'varying vec2 mPos;\n\n'                                                            +

        'void main () {\n'                                                                  +
        '	float intervalSize = 1.0 / float(numPixels);\n'                                   +
        '	float result;\n'                                                                  +
        '	float result2;\n\n'                                                               +

        '	if (isComplex == 0) {\n'                                                          +
        '			// Not a complex number\n'                                                      +
        '		// mPos are the coordinates of the center of the new pixel\n'                    +
        '		// this is also the shared vertex of the old pixels we want to compare\n'        +
        '		// => access the center of those pixels\n'                                       +
        '		float a = texture2D(tex, mPos + intervalSize * vec2(-0.25)).x;\n'                +
        '		float b = texture2D(tex, mPos + intervalSize * vec2(0.25)).x;\n'                 +
        '		float c = texture2D(tex, mPos + intervalSize * vec2(-0.25, 0.25)).x;\n'          +
        '		float d = texture2D(tex, mPos + intervalSize * vec2(0.25, -0.25)).x;\n'          +
        '		result = max(max(a, b), max(c, d));\n'                                           +
        '		result2 = min(min(a, b), min(c, d)) * float(useSameChannel);\n\n'                +

        '		a = texture2D(tex, mPos + intervalSize * vec2(-0.25)).y;\n'                      +
        '		b = texture2D(tex, mPos + intervalSize * vec2(0.25)).y;\n'                       +
        '		c = texture2D(tex, mPos + intervalSize * vec2(-0.25, 0.25)).y;\n'                +
        '		d = texture2D(tex, mPos + intervalSize * vec2(0.25, -0.25)).y;\n'                +
        '		result2 += min(min(a, b), min(c, d)) * abs(float(1-useSameChannel));\n'          +
        '	} else {\n'                                                                       +
        '			// Complex number, we are looking for the max module (abs)\n'                   +
        '		// mPos are the coordinates of the center of the new pixel\n'                    +
        '		// this is also the shared vertex of the old pixels we want to compare\n'        +
        '		// => access the center of those pixels\n'                                       +
        '		float a = length(texture2D(tex, mPos + intervalSize * vec2(-0.25)).xy);\n'       +
        '		float b = length(texture2D(tex, mPos + intervalSize * vec2(0.25)).xy);\n'        +
        '		float c = length(texture2D(tex, mPos + intervalSize * vec2(-0.25, 0.25)).xy);\n' +
        '		float d = length(texture2D(tex, mPos + intervalSize * vec2(0.25, -0.25)).xy);\n' +
        '		result = max(max(a, b), max(c, d));\n'                                           +
        '		result2 = min(min(a, b), min(c, d));\n'                                          +
        '	}\n\n'                                                                            +

        '	gl_FragColor = vec4(result, result2, 0.0, 1.0);\n'                                +
        '}\n',

    'pass-frag':
        '#include "preamble"\n\n'                                          +

        'uniform sampler2D Frame;\n\n'                                     +

        'varying vec2 vTexCoord;\n\n'                                      +

        'void main() {\n'                                                  +
        '    gl_FragColor = vec4(texture2D(Frame, vTexCoord).rgb, 1.0);\n' +
        '}\n',

    'pf-conv-frag':
        '#include "preamble"\n\n'                                                          +

        '// our texture\n'                                                                 +
        'uniform sampler2D u_image;\n'                                                     +
        'uniform sampler2D u_kernel;\n\n'                                                  +

        '#define KERNEL_SIZE 512\n'                                                        +
        'uniform int u_numPixels;\n\n'                                                     +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '	// vec2 textCoord = gl_FragCoord.xy / u_textureSize;\n'                          +
        '    float knlInterval = 1.0 / float(KERNEL_SIZE);\n'                              +
        '    vec2 oneImgPixel = vec2(0.0, 1.0 / float(u_numPixels));\n'                    +
        '	vec4 meanColor = vec4(0);\n'                                                     +
        '	int ms = KERNEL_SIZE / 2;\n'                                                     +
        '	for (int i = 0; i < KERNEL_SIZE; i++) {\n'                                       +
        '        float knlIdx = (float(i) + 0.5) * knlInterval;\n'                         +
        '		meanColor += texture2D(u_image, mPos + oneImgPixel*vec2(i - ms)) *\n'           +
        '            texture2D(u_kernel, vec2(knlIdx, 0.5)) * vec4(knlIdx > 0.0 && knlIdx' +
                                                                            ' < 1.0);\n'   +
        '	}\n'                                                                             +
        '	gl_FragColor = meanColor;\n'                                                     +
        '}\n',

    'pf-filter-frag':
        '#include "preamble"\n\n'                                                       +

        'uniform sampler2D fluence;\n'                                                  +
        'uniform sampler2D timeTex;\n\n'                                                +

        'uniform float deltaT;\n'                                                       +
        'uniform float wl;\n'                                                           +
        'uniform int numIntervals;\n\n'                                                 +

        'varying vec2 mPos;\n\n'                                                        +

        'void main() {\n'                                                               +
        '    float t = texture2D(timeTex, vec2(mPos.x, 0.5)).x;\n'                      +
        '    float tmax = deltaT * float(numIntervals);\n'                              +
        '    float sigma = 3.0*wl;\n\n'                                                 +

        '    //float pf = exp(-(t-tmax/2.0) * (t-tmax/2.0) / (4*sigma*sigma)) *\n'      +
        '    //    exp(2i * pi / wl * t);\n\n'                                          +

        '    float realPart = exp(-(t-tmax/2.0) * (t-tmax/2.0) / (4.0*sigma*sigma));\n' +
        '    float imagExp = 2.0 * PI / wl * t;\n\n'                                    +

        '    vec2 baseImag = vec2(cos(imagExp), sin(imagExp));\n\n'                     +

        '    vec2 pf = realPart * baseImag;\n\n'                                        +

        '    gl_FragColor = vec4(pf, 0.0, 0.0);\n'                                      +
        '}\n',

    'preamble':
        '#define PI      3.1415926536\n'   +
        '#define PI_HALF 1.5707963268\n\n' +

        'precision highp float;\n',

    'rand':
        'float rand(inout vec4 state) {\n'                                         +
        '    const vec4 q = vec4(   1225.0,    1585.0,    2457.0,    2098.0);\n'   +
        '    const vec4 r = vec4(   1112.0,     367.0,      92.0,     265.0);\n'   +
        '    const vec4 a = vec4(   3423.0,    2646.0,    1707.0,    1999.0);\n'   +
        '    const vec4 m = vec4(4194287.0, 4194277.0, 4194191.0, 4194167.0);\n\n' +

        '    vec4 beta = floor(state/q);\n'                                        +
        '    vec4 p = a*(state - beta*q) - beta*r;\n'                              +
        '    beta = (1.0 - sign(p))*0.5*m;\n'                                      +
        '    state = p + beta;\n'                                                  +
        '    return fract(dot(state/m, vec4(1.0, -1.0, 1.0, -1.0)));\n'            +
        '}\n',

    'ray-frag':
        '#include "preamble"\n\n'                 +

        'varying vec3 vColor;\n'                  +
        'varying vec3 vTexCoord;\n'               +
        'varying float t0;\n'                     +
        'varying float t1;\n'                     +
        'varying vec2 vPosition;\n'               +
        'varying vec2 posA;\n'                    +
        'varying vec2 posB;\n\n'                  +

        'void main() {\n'                         +
        '    gl_FragColor = vec4(vColor, 1.0);\n' +
        '}\n',

    'ray-vert':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D PosDataA;\n'                                                    +
        'uniform sampler2D PosDataB;\n'                                                    +
        'uniform sampler2D RgbData;\n'                                                     +
        'uniform sampler2D TimeDataA;\n'                                                   +
        'uniform sampler2D TimeDataB;\n'                                                   +
        'uniform float Aspect;\n\n'                                                        +

        'attribute vec3 TexCoord;\n\n'                                                     +

        'varying vec3 vColor;\n'                                                           +
        'varying vec3 vTexCoord;\n'                                                        +
        'varying float t0;\n'                                                              +
        'varying float t1;\n'                                                              +
        'varying vec2 vPosition;\n'                                                        +
        'varying vec2 posA;\n'                                                             +
        'varying vec2 posB;\n\n'                                                           +

        'void main() {\n'                                                                  +
        '    posA = texture2D(PosDataA, TexCoord.xy).xy;\n'                                +
        '    posB = texture2D(PosDataB, TexCoord.xy).xy;\n'                                +
        '    vec2 pos = mix(posA, posB, TexCoord.z);\n'                                    +
        '    vec2 dir = posB - posA;\n'                                                    +
        '    t0 = texture2D(TimeDataA, TexCoord.xy).x;\n'                                  +
        '    t1 = texture2D(TimeDataB, TexCoord.xy).x;\n'                                  +
        '    float biasCorrection = clamp(length(dir)/max(abs(dir.x), abs(dir.y)), 1.0, 1' +
                                                                           '.414214);\n\n' +

        '    gl_Position = vec4(pos.x/Aspect, pos.y, 0.0, 1.0);\n'                         +
        '    vPosition = pos;\n'                                                           +
        '    vColor = texture2D(RgbData, TexCoord.xy).rgb*biasCorrection;\n'               +
        '    vTexCoord = TexCoord;\n'                                                      +
        '}\n',

    'scene1':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n'                                                           +
        '#include "csg-intersect"\n\n'                                                     +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    biconvexLensIntersect   (ray, vec2(-0.4, 0.0), 0.375, 0.15,   0.75, 0.75, 1.' +
                                                                          '0, isect);\n'   +
        '    biconcaveLensIntersect  (ray, vec2( 0.4, 0.0), 0.375, 0.0375, 0.75, 0.75, 1.' +
                                                                          '0, isect);\n'   +
        '    planoConvexLensIntersect(ray, vec2(-1.2, 0.0), 0.375, 0.075,  0.75,       1.' +
                                                                          '0, isect);\n'   +
        '    meniscusLensIntersect   (ray, vec2( 0.8, 0.0), 0.375, 0.15,   0.45, 0.75, 1.' +
                                                                          '0, isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sellmeierIor(vec3(1.6215, 0.2563, 1.6445), vec3(0.0122, 0.05' +
                                                         '96, 147.4688), lambda)/1.4;\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene10':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2( 1.2, -1.0), vec2( 1.2,   1.0), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(-0.95, 0.2), vec2(-0.95, -0.2), 0.0, isect);\n'       +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene2':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    sphereIntersect(ray, vec2(-1.424, -0.8), 0.356, 1.0, isect);\n'               +
        '    sphereIntersect(ray, vec2(-0.72,  -0.8), 0.356, 2.0, isect);\n'               +
        '    sphereIntersect(ray, vec2( 0.0,   -0.8), 0.356, 3.0, isect);\n'               +
        '    sphereIntersect(ray, vec2( 0.72,  -0.8), 0.356, 4.0, isect);\n'               +
        '    sphereIntersect(ray, vec2( 1.424, -0.8), 0.356, 5.0, isect);\n'               +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '           if (isect.mat == 1.0) { return sampleRoughMirror(state, wiLocal, thro' +
                                                                      'ughput, 0.02);\n'   +
        '    } else if (isect.mat == 2.0) { return sampleRoughMirror(state, wiLocal, thro' +
                                                                      'ughput, 0.05);\n'   +
        '    } else if (isect.mat == 3.0) { return sampleRoughMirror(state, wiLocal, thro' +
                                                                       'ughput, 0.1);\n'   +
        '    } else if (isect.mat == 4.0) { return sampleRoughMirror(state, wiLocal, thro' +
                                                                       'ughput, 0.2);\n'   +
        '    } else if (isect.mat == 5.0) { return sampleRoughMirror(state, wiLocal, thro' +
                                                                       'ughput, 0.5);\n'   +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene3':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.2,  0.8), 1.0, isect);\n'                +
        '    sphereIntersect(ray, vec2(-0.7, -0.45), 0.35, 3.0, isect);\n'                 +
        '    sphereIntersect(ray, vec2( 0.7, -0.45), 0.35, 2.0, isect);\n'                 +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 2.0) {\n'                                                    +
        '        float ior = sellmeierIor(vec3(1.6215, 0.2563, 1.6445), vec3(0.0122, 0.05' +
                                                         '96, 147.4688), lambda)/1.4;\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 1.0) {\n'                                             +
        '             if (isect.n.x == -1.0) throughput *= vec3(0.14,  0.45,  0.091);\n'   +
        '        else if (isect.n.x ==  1.0) throughput *= vec3(0.63,  0.065, 0.05);\n'    +
        '        else                        throughput *= vec3(0.725, 0.71,  0.68);\n'    +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene4':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    prismIntersect(ray, vec2(0.0, 0.0), 0.6, 1.0, isect);\n'                      +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sellmeierIor(vec3(1.6215, 0.2563, 1.6445), vec3(0.0122, 0.05' +
                                                          '96, 17.4688), lambda)/1.8;\n'   +
        '        float wiDotN;\n'                                                          +
        '        vec2 res = sampleRoughDielectric(state, wiLocal, 0.1, ior, wiDotN);\n'    +
        '        if (wiDotN < 0.0)\n'                                                      +
        '            tMult = ior;\n'                                                       +
        '        return res;\n'                                                            +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.05);\n'                                              +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene5':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n'                                                           +
        '#include "csg-intersect"\n\n'                                                     +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    planoConcaveLensIntersect(ray, vec2(0.8, 0.0), 0.6, 0.3, 0.6, 1.0, isect);\n' +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene6':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    sphereIntersect(ray, vec2(-0.95,   0.25),    0.4, 1.0, isect);\n'             +
        '    //sphereIntersect(ray, vec2(-0.15,  -0.25),    0.2, 1.0, isect);\n'           +
        '    //sphereIntersect(ray, vec2(1.11667, 0.18333), 0.2, 1.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.168689, -0.885424), vec2(1.13131,  -0.614576), 2.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(1.71686,   0.310275), vec2(0.983139,  0.989725), 2.0' +
                                                                           ', isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene7':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n'                                                           +
        '#include "csg-intersect"\n\n'                                                     +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 0.0, isect);\n'                +
        '    sphereIntersect(ray, vec2(0.0, 0.0), 0.4, 1.0, isect);\n'                     +
        '    biconvexLensIntersect(ray, vec2(-0.4, -0.65), 0.3, 0.12, 0.5, 0.5, 1.0, isec' +
                                                                                 't);\n'   +
        '    meniscusLensIntersect(ray, vec2(-0.8, -0.65), 0.3, 0.08, -0.5, -0.5, 1.0, is' +
                                                                               'ect);\n'   +
        '    planoConcaveLensIntersect(ray, vec2(1.3, 0.0), 0.3, 0.0, 0.3, 2.0, isect);\n' +
        '    prismIntersect(ray, vec2(0.8, -0.7), 0.2, 1.0, isect);\n'                     +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sellmeierIor(vec3(1.6215, 0.2563, 1.6445), vec3(0.0122, 0.05' +
                                                 '96, 147.4688), lambda)/1.6; // SF10\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.25);\n'                                              +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene8':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 3.0, isect);\n'                +
        '    sphereIntersect(ray, vec2(-0.95,   0.25),    0.4, 1.0, isect);\n'             +
        '    sphereIntersect(ray, vec2(-0.15,  -0.25),    0.2, 1.0, isect);\n'             +
        '    sphereIntersect(ray, vec2(1.11667, 0.18333), 0.2, 1.0, isect);\n'             +
        '    lineIntersect(ray, vec2(0.168689, -0.885424), vec2(1.13131,  -0.614576), 2.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(1.71686,   0.310275), vec2(0.983139,  0.989725), 2.0' +
                                                                           ', isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene9':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 0.0, isect);\n'           +
        '    sphereIntersect(ray, vec2(-0.95,   0.25),    0.4, 0.0, isect); // top left -' +
                                                                '1.35,-0.15 0.15,0.65\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,' +
                                                         ' 0.0200, 103.56), lambda));\n'   +
        '        if (wiLocal.y < 0.0) {\n'                                                 +
        '            // The ray comes from inside the dielectric material - it will take ' +
                                                                        'longer times\n'   +
        '            tMult = ior;\n'                                                       +
        '        }\n'                                                                      +
        '        return sampleDielectric(state, wiLocal, ior);\n'                          +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    } else if (isect.mat == 3.0) {\n'                                             +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'show-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D fluence;\n'                                                     +
        'uniform sampler2D colormap;\n\n'                                                  +

        'uniform sampler2D maxValue; // it would be nice to check what is faster\n'        +
        'uniform int isComplex;\n\n'                                                       +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '    if (mPos.x > 1.0) {\n'                                                        +
        '        gl_FragColor = vec4(vec3(0.0), 1.0);\n'                                   +
        '    } else {\n'                                                                   +
        '        vec2 fluenceVec = texture2D(fluence, mPos).xy;\n'                         +
        '        // If complex number, compute module (length), otherwise, use only the f' +
                                                                      'irst component\n'   +
        '        float fluenceTex = abs(fluenceVec.x) * float(1 - isComplex) + length(flu' +
                                                        'enceVec) * float(isComplex);\n'   +
        '        gl_FragColor = texture2D(colormap, vec2(fluenceTex / texture2D(maxValue,' +
                                                               ' vec2(0.5)).x, 0.5));\n'   +
        '    }\n'                                                                          +
        '}\n',

    'show-vert':
        '#include "preamble"\n\n'                       +

        'attribute vec2 Position;\n'                    +
        'uniform float Aspect;\n\n'                     +

        'varying vec2 mPos;\n\n'                        +

        'void main() {\n'                               +
        '    gl_Position = vec4(Position, 1.0, 1.0);\n' +
        '    mPos = Position/2.0+vec2(0.5);\n'          +
        '    mPos.x = mPos.x * Aspect;\n'               +
        '}\n',

    'trace-frag':
        '#extension GL_EXT_draw_buffers : require\n'                                       +
        '#include "preamble"\n'                                                            +
        '#include "rand"\n\n'                                                              +

        'uniform sampler2D PosData;\n'                                                     +
        'uniform sampler2D RngData;\n'                                                     +
        'uniform sampler2D RgbData;\n'                                                     +
        'uniform sampler2D TimeData;\n\n'                                                  +

        'varying vec2 vTexCoord;\n\n'                                                      +

        'struct Ray {\n'                                                                   +
        '    vec2 pos;\n'                                                                  +
        '    vec2 dir;\n'                                                                  +
        '    vec2 invDir;\n'                                                               +
        '    vec2 dirSign;\n'                                                              +
        '    float t0;\n'                                                                  +
        '};\n'                                                                             +
        'struct Intersection {\n'                                                          +
        '    float tMin;\n'                                                                +
        '    float tMax;\n'                                                                +
        '    vec2 n;\n'                                                                    +
        '    float mat;\n'                                                                 +
        '};\n\n'                                                                           +

        'void intersect(Ray ray, inout Intersection isect);\n'                             +
        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                              'out vec3 throughput, out float tMult);\n\n' +

        'Ray unpackRay(vec4 posDir) {\n'                                                   +
        '    vec2 pos = posDir.xy;\n'                                                      +
        '    vec2 dir = posDir.zw;\n'                                                      +
        '    vec4 t0 = texture2D(TimeData, vTexCoord);\n'                                  +
        '    dir.x = abs(dir.x) < 1e-5 ? 1e-5 : dir.x; /* The nuclear option to fix NaN i' +
                                                          'ssues on some platforms */\n'   +
        '    dir.y = abs(dir.y) < 1e-5 ? 1e-5 : dir.y;\n'                                  +
        '    return Ray(pos, normalize(dir), 1.0/dir, sign(dir), t0.x);\n'                 +
        '}\n\n'                                                                            +

        'void main() {\n'                                                                  +
        '    vec4 posDir    = texture2D(PosData, vTexCoord);\n'                            +
        '    vec4 state     = texture2D(RngData, vTexCoord);\n'                            +
        '    vec4 rgbLambda = texture2D(RgbData, vTexCoord);\n\n'                          +

        '    Ray ray = unpackRay(posDir);\n'                                               +
        '    Intersection isect;\n'                                                        +
        '    isect.tMin = 1e-4;\n'                                                         +
        '    isect.tMax = 1e30;\n'                                                         +
        '    intersect(ray, isect);\n\n'                                                   +

        '    vec2 t = vec2(-isect.n.y, isect.n.x);\n'                                      +
        '    vec2 wiLocal = -vec2(dot(t, ray.dir), dot(isect.n, ray.dir));\n'              +
        '    float tMult;\n'                                                               +
        '    vec2 woLocal = sample(state, isect, rgbLambda.w, wiLocal, rgbLambda.rgb, tMu' +
                                                                                'lt);\n\n' +

        '    if (isect.tMax == 1e30) {\n'                                                  +
        '        rgbLambda.rgb = vec3(0.0);\n'                                             +
        '    } else {\n'                                                                   +
        '        posDir.xy = ray.pos + ray.dir*isect.tMax;\n'                              +
        '        posDir.zw = woLocal.y*isect.n + woLocal.x*t;\n'                           +
        '    }\n\n'                                                                        +

        '    gl_FragData[0] = posDir;\n'                                                   +
        '    gl_FragData[1] = state;\n'                                                    +
        '    gl_FragData[2] = rgbLambda;\n'                                                +
        '    gl_FragData[3] = vec4(ray.t0 + tMult * isect.tMax, 0.0, 0.0, 0.0);\n'         +
        '}\n',

    'trace-vert':
        '#include "preamble"\n\n'                  +

        'attribute vec3 Position;\n'               +
        'attribute vec2 TexCoord;\n\n'             +

        'varying vec2 vTexCoord;\n\n'              +

        'void main() {\n'                          +
        '    gl_Position = vec4(Position, 1.0);\n' +
        '    vTexCoord = TexCoord;\n'              +
        '}\n'
}