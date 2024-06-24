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

        'uniform sampler2D radiance; // x time, y spad\n\n'                                +

        'uniform int useAbsolute; // To accumulate for the conventional camera\n'          +
        'uniform float isConfocalModel; // 1.0 for true, 0.0 for false\n'                  +
        'uniform float instant;\n'                                                         +
        'uniform vec2 laserPos;\n'                                                         +
        'uniform vec2 spadPos;\n'                                                          +
        'uniform sampler2D wallGrid; // laser and spad grid\n\n'                           +

        'uniform sampler2D planeGrid; // Plane to reconstruct\n'                           +
        '        // positions of the considered pixels, on a row\n\n'                      +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'const int numSpads = {numSpads};\n\n'                                             +

        'void main() {\n'                                                                  +
        '    float spadDist = 1.0 / float(numSpads);\n'                                    +
        '    float xSpad = spadDist / 2.0;\n\n'                                            +

        '    vec2 pixelPos = texture2D(planeGrid, vec2(mPos.x, 1.0 - mPos.y)).xy;\n'       +
        '    vec2 radianceAccum = vec2(0.0);\n'                                            +
        '    for (int i = 0; i < numSpads; i++) {\n'                                       +
        '        vec2 wallPos = texture2D(wallGrid, vec2(xSpad, 0.5)).xy;\n'               +
        '        float dlp = distance(wallPos, laserPos); // distance laser device to cap' +
                                                           'tured (illuminated) point\n'   +
        '        float dsp = distance(wallPos, spadPos); // distance spad device to captu' +
                                                                          'red points\n'   +
        '        float ds  = distance(wallPos, pixelPos); // distance captured (illuminat' +
                                                    'ed) point to reconstructed point\n'   +
        '        float dt = (1.0 + isConfocalModel) * ds + dsp + dlp + instant;\n\n'       +

        '        float t = dt / tmax;\n'                                                   +
        '        radianceAccum += texture2D(radiance, vec2(t, xSpad)).xy * vec2(t <= 1.0)' +
                                                                                   ';\n'   +
        '        xSpad += spadDist;\n'                                                     +
        '    }\n\n'                                                                        +

        '    gl_FragColor = vec4(length(radianceAccum) * float(useAbsolute) + radianceAcc' +
                                                     'um.x * float(1 - useAbsolute), \n'   +
        '            radianceAccum.y * float(1 - useAbsolute), 0.0, 1.0);\n'               +
        '}\n',

    'bp-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform float tmax;\n\n'                                                          +

        'uniform sampler2D radiance; // x time, y spad\n\n'                                +

        'uniform int useAbsolute; // To accumulate for the conventional camera\n'          +
        'uniform float lightIsLaser; // 1.0 for true, 0.0 for false\n'                     +
        'uniform float isConfocalModel; // 1.0 for true, 0.0 for false\n'                  +
        'uniform float instant;\n'                                                         +
        'uniform vec2 laserPos;\n'                                                         +
        'uniform vec2 laserGrid; // could be more than one, actually\n'                    +
        'uniform vec2 spadPos;\n'                                                          +
        'uniform sampler2D spadGrid;\n\n'                                                  +

        'uniform sampler2D planeGrid; // Plane to reconstruct\n'                           +
        '        // positions of the considered pixels, on a row\n\n'                      +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'const int numSpads = {numSpads};\n\n'                                             +

        'void main() {\n'                                                                  +
        '    float spadDist = 1.0 / float(numSpads);\n'                                    +
        '    float xSpad = spadDist / 2.0;\n\n'                                            +

        '    vec2 pixelPos = texture2D(planeGrid, vec2(mPos.x, 1.0 - mPos.y)).xy;\n'       +
        '    vec2 radianceAccum = vec2(0.0);\n'                                            +
        '    for (int i = 0; i < numSpads; i++) {\n'                                       +
        '        vec2 wallSpad = texture2D(spadGrid, vec2(xSpad, 0.5)).xy;\n'              +
        '        float dlp = distance(laserGrid, laserPos);\n'                             +
        '        float dl  = distance(laserGrid, pixelPos);\n'                             +
        '        float dsp = distance(wallSpad, spadPos); // distance spad device to capt' +
                                                                         'ured points\n'   +
        '        float ds  = distance(wallSpad, pixelPos);\n'                              +
        '        float dt = ds + dsp + dl * isConfocalModel + dlp * lightIsLaser + instan' +
                                                                                  't;\n\n' +

        '        float t = dt / tmax;\n'                                                   +
        '        radianceAccum += texture2D(radiance, vec2(t, xSpad)).xy * vec2(t <= 1.0)' +
                                                                                   ';\n'   +
        '        xSpad += spadDist;\n'                                                     +
        '    }\n'                                                                          +
        '    gl_FragColor = vec4(length(radianceAccum) * float(useAbsolute) + radianceAcc' +
                                                     'um.x * float(1 - useAbsolute), \n'   +
        '            radianceAccum.y * float(1 - useAbsolute), 0.0, 1.0);\n'               +
        '}\n',

    'bp-vert':
        '#include "preamble"\n\n'                       +

        'attribute vec2 Position;\n\n'                  +

        'varying vec2 mPos;\n\n'                        +

        'void main() {\n'                               +
        '    gl_Position = vec4(Position, 1.0, 1.0);\n' +
        '    mPos = Position/2.0+vec2(0.5);\n'          +
        '}\n',

    'bsdf-rwall':
        'float coth(float x) {\n'                                                          +
        '    float e2x = exp(2.0 * x);\n'                                                  +
        '    return (e2x + 1.0) / (e2x - 1.0);\n'                                          +
        '}\n\n'                                                                            +

        'float sech2(float x) {\n'                                                         +
        '    float num = 2.0 * exp(x);\n'                                                  +
        '    float denom = 1.0 / (exp(2.0 * x) + 1.0);\n'                                  +
        '    return num*num * denom*denom;\n'                                              +
        '}\n\n'                                                                            +

        'float pdf(int matId, float cosTheta, float sigma) {\n'                            +
        '    if (cosTheta < 0.0) {\n'                                                      +
        '        return 0.0; // Not true for RoughDielectric, but for that the ior is nee' +
                                                                                 'ded\n'   +
        '    }\n'                                                                          +
        '    if (matId == 2) { // Diffuse\n'                                               +
        '        return cosTheta / 2.0;\n'                                                 +
        '    } else if (matId == 5) { // RoughMirror\n'                                    +
        '        float sigmaSq = sigma*sigma;\n'                                           +
        '        float invSigmaSq = 1.0/sigmaSq;\n'                                        +
        '        return 0.25*invSigmaSq * coth(PI*0.25*invSigmaSq) * sech2(acos(cosTheta)' +
                                                                   '*0.5*invSigmaSq);\n'   +
        '    } else {\n'                                                                   +
        '        return 0.0; // Not true for RoughDielectric, but for that the ior is nee' +
                                                                                 'ded\n'   +
        '    }\n'                                                                          +
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

    'geometry-frag':
        '#include "preamble"\n\n'      +

        'uniform vec4 uColor;\n\n'     +

        'void main() {\n'              +
        '    gl_FragColor = uColor;\n' +
        '}\n',

    'geometry-vert':
        '#include "preamble"\n\n'                  +

        'attribute vec3 Position;\n\n'             +

        'void main() {\n'                          +
        '    gl_Position = vec4(Position, 1.0);\n' +
        '}\n',

    'h-conf-vert':
        '#include "preamble"\n'                                                            +
        '#include "bsdf-rwall"\n\n'                                                        +

        'uniform sampler2D PosDataA;\n'                                                    +
        'uniform sampler2D PosDataB;\n'                                                    +
        'uniform sampler2D RgbData;\n'                                                     +
        'uniform sampler2D TimeDataA;\n\n'                                                 +

        'uniform float tmax;\n'                                                            +
        'uniform float yNorm;\n'                                                           +
        'uniform float spadRadius;\n'                                                      +
        'uniform vec2 spadPos;   // Position of the physical spad device\n'                +
        'uniform vec2 SpadGrid;  // Position scanned by device and illuminated by laser\n' +
        'uniform vec2 SpadNormal;\n'                                                       +
        'uniform int matId;      // Id of the relay wall bsdf, 2 = diffuse, 5 = roughmirr' +
                                                        'or, no others should be used\n\n' +

        'attribute vec2 TexCoord;\n\n'                                                     +

        'varying vec3 vColor;\n\n'                                                         +

        'void main() {\n'                                                                  +
        '    gl_Position = vec4(vec3(-1.0), 1.0);\n\n'                                     +

        '    vec2 posA = texture2D(PosDataA, TexCoord.xy).xy;\n'                           +
        '    vec2 posB = texture2D(PosDataB, TexCoord.xy).xy;\n'                           +
        '    vec2 dir = posB - posA;\n'                                                    +
        '    float t0 = texture2D(TimeDataA, TexCoord.xy).x;\n'                            +
        '    float biasCorrection = clamp(length(dir)/max(abs(dir.x), abs(dir.y)), 1.0, 1' +
                                                                           '.414214);\n\n' +

        '    if (distance(posA, SpadGrid) <= spadRadius) {\n'                              +
        '        float t = t0 + distance(posA, spadPos); // Time needed to reach the sens' +
                                               'or, assuming vacuum and no occlusions\n'   +
        '        float x = t / tmax * 2.0 - 1.0;\n'                                        +
        '        float y = 2.0 * yNorm - 1.0;\n\n'                                         +

        '        vec2 dir = spadPos - posA;\n'                                             +
        '        float cosine = dot(SpadNormal, dir);\n'                                   +
        '        float p = pdf(matId, cosine, 0.5);\n\n'                                   +

        '        gl_PointSize = 1.0;\n'                                                    +
        '        gl_Position = vec4(x, y, 0.0, 1.0);\n'                                    +
        '        vColor = max(vec3(0.0), p * texture2D(RgbData, TexCoord.xy).rgb*biasCorr' +
                                                   'ection / vec3(2.0 * spadRadius));\n'   +
        '    }\n'                                                                          +
        '}\n',

    'h-frag':
        '#include "preamble"\n\n'                                                   +

        'varying vec3 vColor;\n\n'                                                  +

        'void main() {\n'                                                           +
        '    gl_FragColor = vec4((vColor.r+vColor.g+vColor.b)/3.0,0.0,0.0, 1.0);\n' +
        '}\n',

    'h-vert':
        '#include "preamble"\n'                                                            +
        '#include "bsdf-rwall"\n\n'                                                        +

        'uniform sampler2D PosDataA;\n'                                                    +
        'uniform sampler2D PosDataB;\n'                                                    +
        'uniform sampler2D RgbData;\n'                                                     +
        'uniform sampler2D TimeDataA;\n'                                                   +
        'uniform sampler2D SpadGrid;\n'                                                    +
        'uniform sampler2D SpadNormals;\n\n'                                               +

        'uniform float tmax;\n'                                                            +
        'uniform float spadRadius;\n'                                                      +
        'uniform vec2 spadPos;   // Position of the physical spad device\n'                +
        'uniform int matId;      // Id of the relay wall bsdf, 2 = diffuse, 5 = roughmirr' +
                                                        'or, no others should be used\n\n' +

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
        '            vec2 dir = normalize(spadPos - posA);\n'                              +
        '            float cosine = dot(n, dir);\n'                                        +
        '            float p = pdf(matId, cosine, 0.5);\n\n'                               +

        '            gl_PointSize = 1.0;\n'                                                +
        '            gl_Position = vec4(x, y, 0.0, 1.0);\n'                                +
        '            vColor = max(vec3(0.0), p * texture2D(RgbData, TexCoord.xy).rgb*bias' +
                                               'Correction / vec3(2.0 * spadRadius));\n'   +
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

        'uniform sampler2D radiance;\n'                                                    +
        'uniform float Aspect;\n\n'                                                        +

        'uniform vec2 numPixels;\n\n'                                                      +

        'const int kernelWidth = 3;\n'                                                     +
        'uniform float kernel[kernelWidth*kernelWidth];\n\n'                               +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '    if (mPos.x > 1.0) {\n'                                                        +
        '        gl_FragColor = vec4(vec3(0.0), 1.0);\n'                                   +
        '    } else {\n\n'                                                                 +

        '        float acc = 0.0;\n'                                                       +
        '        vec2 ps = 1.0 / numPixels;\n'                                             +
        '        vec2 kps = vec2(Aspect / float(kernelWidth), 1.0 / float(kernelWidth)); ' +
                                                                '// kernel pixel size\n\n' +

        '        for (int i = 0; i < kernelWidth*kernelWidth; i++){\n'                     +
        '            vec2 d = -vec2(kernelWidth / 2);\n'                                   +
        '            d.x += (i == 0 || i == 3 || i == 6) ? 0.0 : (i == 1 || i == 4 || i =' +
                                                                   '= 7) ? 1.0 : 2.0;\n'   +
        '            d.y += float(i / kernelWidth);\n'                                     +
        '            vec2 posTex = mPos + d * ps;\n'                                       +
        '            acc += kernel[i] * texture2D(radiance, posTex).x * float(posTex.x >=' +
                     ' 0.0 && posTex.x <= 1.0 && posTex.y >= 0.0 && posTex.y <= 1.0);\n'   +
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
        '#include "preamble"\n\n'                                                          +

        '// Inspired from https://github.com/regl-project/regl/blob/gh-pages/example/redu' +
                                                                            'ction.js\n\n' +

        'uniform sampler2D tex;\n'                                                         +
        'uniform int useSameChannel;\n'                                                    +
        'uniform int isComplex;\n'                                                         +
        'uniform vec2 numPixels; // Original width and height\n'                           +
        'varying vec2 mPos;\n\n'                                                           +

        'void main () {\n'                                                                 +
        '	vec2 intervalSize = 1.0 / numPixels; // Width and height of each pixel in tex\n' +
        '	float result;\n'                                                                 +
        '	float result2;\n'                                                                +
        '	vec2 np = floor(numPixels / 2.0);\n'                                             +
        '	float x = floor(mPos.x * np.x);\n'                                               +
        '    float y = floor(mPos.y * np.y);\n'                                            +
        '	bool oddX = (numPixels.x > 1.0) && (floor(numPixels.x / 2.0) < (numPixels.x / 2' +
                                                                               '.0));\n'   +
        '	bool oddY = (numPixels.y > 1.0) && (floor(numPixels.y / 2.0) < (numPixels.y / 2' +
                                                                               '.0));\n\n' +

        '	if (isComplex == 0) {\n'                                                         +
        '			// Not a complex number\n'                                                     +
        '		// mPos are the coordinates of the center of the new pixel\n'                   +
        '		// this is also the shared vertex of the old pixels we want to compare\n'       +
        '		// => access the center of those pixels\n'                                      +
        '		float a = texture2D(tex, mPos + intervalSize * vec2(-0.5)).x;\n'                +
        '		float b = texture2D(tex, mPos + intervalSize * vec2(0.5)).x;\n'                 +
        '		float c = texture2D(tex, mPos + intervalSize * vec2(-0.5, 0.5)).x;\n'           +
        '		float d = texture2D(tex, mPos + intervalSize * vec2(0.5, -0.5)).x;\n'           +
        '		result = max(max(a, b), max(c, d));\n'                                          +
        '		result2 = min(min(a, b), min(c, d)) * float(useSameChannel);\n\n'               +

        '		a = texture2D(tex, mPos + intervalSize * vec2(-0.5)).y;\n'                      +
        '		b = texture2D(tex, mPos + intervalSize * vec2(0.5)).y;\n'                       +
        '		c = texture2D(tex, mPos + intervalSize * vec2(-0.5, 0.5)).y;\n'                 +
        '		d = texture2D(tex, mPos + intervalSize * vec2(0.5, -0.5)).y;\n'                 +
        '		result2 += min(min(a, b), min(c, d)) * abs(float(1-useSameChannel));\n\n'       +

        '		if (oddX) {\n'                                                                  +
        '			// Odd number of pixels in X dimension, add the last one to the last result\n' +
        '			if (x == np.x - 1.0) {\n'                                                      +
        '				a = texture2D(tex, mPos + intervalSize * vec2(1.5, 0.5)).x;\n'                +
        '				b = texture2D(tex, mPos + intervalSize * vec2(1.5, -0.5)).x;\n'               +
        '				c = texture2D(tex, mPos + intervalSize * vec2(1.5, 0.5)).y;\n'                +
        '				d = texture2D(tex, mPos + intervalSize * vec2(1.5, -0.5)).y;\n'               +
        '				result = max(result, max(a, b));\n'                                           +
        '				result2 = min(result2, min(a, b)) * float(useSameChannel) + min(result2, min' +
                                             '(c, d)) * abs(float(1-useSameChannel));\n'   +
        '			}\n'                                                                           +
        '		}\n\n'                                                                          +

        '		if (oddY) {\n'                                                                  +
        '			// Odd number of pixels in Y dimension, add the last one to the last result\n' +
        '			if (y == np.y - 1.0) {\n'                                                      +
        '				a = texture2D(tex, mPos + intervalSize * vec2(0.5, 1.5)).x;\n'                +
        '				b = texture2D(tex, mPos + intervalSize * vec2(-0.5, 1.5)).x;\n'               +
        '				c = texture2D(tex, mPos + intervalSize * vec2(0.5, 1.5)).y;\n'                +
        '				d = texture2D(tex, mPos + intervalSize * vec2(-0.5, 1.5)).y;\n'               +
        '				result = max(result, max(a, b));\n'                                           +
        '				result2 = min(result2, min(a, b)) * float(useSameChannel) + min(result2, min' +
                                             '(c, d)) * abs(float(1-useSameChannel));\n'   +
        '			}\n'                                                                           +
        '		}\n\n'                                                                          +

        '		if (oddX && oddY) {\n'                                                          +
        '			// Odd number of pixels in both dimensions, add the original corner to the ne' +
                                                                           'w corner \n'   +
        '				if ((x == np.x - 1.0) && (y == np.y - 1.0)) {\n'                              +
        '				a = texture2D(tex, mPos + intervalSize * vec2(1.5)).x;\n'                     +
        '				b = texture2D(tex, mPos + intervalSize * vec2(1.5)).y;\n'                     +
        '				result = max(result, a);\n'                                                   +
        '				result2 = min(result2, a) * float(useSameChannel) + min(result2, b) * abs(fl' +
                                                             'oat(1-useSameChannel));\n'   +
        '			}\n'                                                                           +
        '		}\n'                                                                            +
        '	} else {\n'                                                                      +
        '			// Complex number, we are looking for the max module (length)\n'               +
        '		// mPos are the coordinates of the center of the new pixel\n'                   +
        '		// this is also the shared vertex of the old pixels we want to compare\n'       +
        '		// => access the center of those pixels\n'                                      +
        '		float a = length(texture2D(tex, mPos + intervalSize * vec2(-0.5)).xy);\n'       +
        '		float b = length(texture2D(tex, mPos + intervalSize * vec2(0.5)).xy);\n'        +
        '		float c = length(texture2D(tex, mPos + intervalSize * vec2(-0.5, 0.5)).xy);\n'  +
        '		float d = length(texture2D(tex, mPos + intervalSize * vec2(0.5, -0.5)).xy);\n'  +
        '		result = max(max(a, b), max(c, d));\n'                                          +
        '		result2 = min(min(a, b), min(c, d));\n\n'                                       +

        '		if (oddX) {\n'                                                                  +
        '			// Odd number of pixels in X dimension, add the last one to the last result\n' +
        '			if (x == np.x - 1.0) {\n'                                                      +
        '				a = length(texture2D(tex, mPos + intervalSize * vec2(1.5, 0.5)).xy);\n'       +
        '				b = length(texture2D(tex, mPos + intervalSize * vec2(1.5, -0.5)).xy);\n'      +
        '				result = max(result, max(a, b));\n'                                           +
        '				result2 = min(result2, min(a, b));\n'                                         +
        '			}\n'                                                                           +
        '		}\n\n'                                                                          +

        '		if (oddY) {\n'                                                                  +
        '			// Odd number of pixels in Y dimension, add the last one to the last result\n' +
        '			if (y == np.y - 1.0) {\n'                                                      +
        '				a = length(texture2D(tex, mPos + intervalSize * vec2(0.5, 1.5)).xy);\n'       +
        '				b = length(texture2D(tex, mPos + intervalSize * vec2(-0.5, 1.5)).xy);\n'      +
        '				result = max(result, max(a, b));\n'                                           +
        '				result2 = min(result2, min(a, b));\n'                                         +
        '			}\n'                                                                           +
        '		}\n\n'                                                                          +

        '		if (oddX && oddY) {\n'                                                          +
        '			// Odd number of pixels in both dimensions, add the original corner to the ne' +
                                                                           'w corner \n'   +
        '				if ((x == np.x - 1.0) && (y == np.y - 1.0)) {\n'                              +
        '				a = length(texture2D(tex, mPos + intervalSize * vec2(1.5)).xy);\n'            +
        '				result = max(result, a);\n'                                                   +
        '				result2 = min(result2, a);\n'                                                 +
        '			}\n'                                                                           +
        '		}\n'                                                                            +
        '	}\n\n'                                                                           +

        '	gl_FragColor = vec4(result, result2, oddY && (y == np.y - 1.0), 1.0);\n'         +
        '}\n',

    'max-vert':
        '#include "preamble"\n\n'                                                          +

        'attribute vec2 Position;\n\n'                                                     +

        'uniform vec2 numPixels;\n\n'                                                      +

        'varying vec2 mPos;\n\n'                                                           +

        'void main() {\n'                                                                  +
        '    gl_Position = vec4(Position, 1.0, 1.0);\n'                                    +
        '    mPos = (Position/2.0+vec2(0.5));\n\n'                                         +

        '    if (numPixels.x > 1.0 && floor(numPixels.x / 2.0) < (numPixels.x / 2.0)) {\n' +
        '        // Odd number of pixels in X dimension\n'                                 +
        '        mPos.x *= (numPixels.x - 1.0) / numPixels.x;\n'                           +
        '    }\n'                                                                          +
        '    if (numPixels.y > 1.0 && floor(numPixels.y / 2.0) < (numPixels.y / 2.0)) {\n' +
        '        // Odd number of pixels in Y dimension\n'                                 +
        '        mPos.y *= (numPixels.y - 1.0) / numPixels.y;\n'                           +
        '    }\n'                                                                          +
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
        'uniform sampler2D u_impulse;\n'                                                   +
        'uniform sampler2D u_kernel;\n\n'                                                  +

        '#define KERNEL_SIZE {numIntervals}\n'                                             +
        '#define KERNEL_INTERVAL 1.0 / {numIntervals}.0\n'                                 +
        '#define KERNEL_START_IDX 0.5 + KERNEL_INTERVAL / 2.0\n\n'                         +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '	vec4 meanColor = vec4(0);\n'                                                     +
        '	float j = floor(mPos.x * float(KERNEL_SIZE)) + float(KERNEL_SIZE / 2);\n'        +
        '	for (int i = 0; i < KERNEL_SIZE; i++) {\n'                                       +
        '        float impIdx = (float(i) + 0.5) * KERNEL_INTERVAL;\n'                     +
        '		float knlIdx = ((j - float(i)) + 0.5) * KERNEL_INTERVAL;\n'                     +
        '		float impulsePixel = texture2D(u_impulse, vec2(impIdx, mPos.y)).x;\n'           +
        '		meanColor += vec4(impulsePixel, impulsePixel, 0.0, 1.0) *\n'                    +
        '            texture2D(u_kernel, vec2(knlIdx, 0.5)) * vec4(knlIdx > 0.0 && knlIdx' +
                                                                            ' < 1.0);\n'   +
        '	}\n\n'                                                                           +

        '	gl_FragColor = meanColor;\n'                                                     +
        '}\n',

    'pf-filter-frag':
        '#include "preamble"\n\n'                                                       +

        'uniform sampler2D radiance;\n'                                                 +
        'uniform sampler2D timeTex;\n\n'                                                +

        'uniform float deltaT;\n'                                                       +
        'uniform float wl;\n'                                                           +
        'uniform float sigma;\n'                                                        +
        'uniform int numIntervals;\n\n'                                                 +

        'varying vec2 mPos;\n\n'                                                        +

        'void main() {\n'                                                               +
        '    float t = texture2D(timeTex, vec2(mPos.x, 0.5)).x;\n'                      +
        '    float tmax = deltaT * float(numIntervals);\n\n'                            +

        '    //float pf = exp(-(t-tmax/2.0) * (t-tmax/2.0) / (2*sigma*sigma)) *\n'      +
        '    //    exp(2i * pi / wl * t);\n\n'                                          +

        '    float realPart = exp(-(t-tmax/2.0) * (t-tmax/2.0) / (2.0*sigma*sigma));\n' +
        '    float imagExp = 2.0 * PI / wl * t;\n\n'                                    +

        '    vec2 baseImag = vec2(cos(imagExp), sin(imagExp));\n\n'                     +

        '    vec2 pf = realPart * baseImag;\n\n'                                        +

        '    gl_FragColor = vec4(pf, 0.0, 0.0);\n'                                      +
        '}\n',

    'plot-frag':
        '#include "preamble"\n\n'                                     +

        '//uniform sampler2D function;\n\n'                           +

        '//uniform float width;\n\n'                                  +

        'varying vec2 mPos;\n\n'                                      +

        'void main() {\n'                                             +
        '    /*gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n'            +
        '    float x = mPos.x / 4.0 + 0.375;\n'                       +
        '    float y = (mPos.y - 0.5) * 2.0;\n'                       +
        '    vec2 value = texture2D(function, vec2(x, mPos.y)).xy;\n' +
        '    if (abs(y - value.x) < width) {\n'                       +
        '        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n'          +
        '    } else if (abs(y - value.y) < width) {\n'                +
        '        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'          +
        '    }*/\n'                                                   +
        '    gl_FragColor = vec4(1.0);\n'                             +
        '}\n',

    'preamble':
        '#define PI      3.1415926536\n'   +
        '#define PI_HALF 1.5707963268\n\n' +

        'precision highp float;\n',

    'rand':
        'float rand(float x) {\n'                                                  +
        '    // https://thebookofshaders.com/10/\n'                                +
        '    return fract(sin(x)*100000.0);\n'                                     +
        '}\n\n'                                                                    +

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

    'ruler-frag':
        '#include "preamble"\n\n'                        +

        'uniform sampler2D u_ruler;\n\n'                 +

        'varying vec2 mPos;\n\n'                         +

        'void main() {\n'                                +
        '    gl_FragColor = texture2D(u_ruler, mPos);\n' +
        '}\n',

    'ruler-vert':
        '#include "preamble"\n\n'                                              +

        'attribute vec2 Position;\n'                                           +
        'attribute vec2 TexCoord;\n'                                           +
        'uniform float Aspect;\n\n'                                            +

        'varying vec2 mPos;\n\n'                                               +

        'void main() {\n'                                                      +
        '    gl_Position = vec4(Position.x / Aspect, Position.y, 1.0, 1.0);\n' +
        '    mPos = TexCoord;\n'                                               +
        '}\n',

    'rwall-frag':
        '#include "preamble"\n\n'                                                           +

        'uniform float numSpads;\n'                                                         +
        'uniform float spadRadius;\n'                                                       +
        'uniform float aspect;\n'                                                           +
        'uniform vec2 firstSpad;\n'                                                         +
        'uniform vec2 lastSpad;\n'                                                          +
        'uniform vec4 uColor;\n\n'                                                          +

        'varying vec2 mPos;\n\n'                                                            +

        'void main() {\n'                                                                   +
        '    float r = spadRadius;\n'                                                       +
        '    gl_FragColor = vec4(0.0);\n'                                                   +
        '    vec2 coord;\n'                                                                 +
        '    coord.x = (mPos.x * 2.0 - 1.0) * aspect;\n'                                    +
        '    coord.y = mPos.y * 2.0 - 1.0;\n'                                               +
        '    float top = firstSpad.y + r;\n'                                                +
        '    float bottom = lastSpad.y - r;\n'                                              +
        '    float left = min(firstSpad.x, lastSpad.x) - r;\n'                              +
        '    float right = max(firstSpad.x, lastSpad.x) + r;\n'                             +
        '    vec2 scanSize = firstSpad - lastSpad;\n'                                       +
        '    vec2 normCoord = (coord - lastSpad) / scanSize;\n'                             +
        '    float n = floor(normCoord.y * (numSpads - 1.0) + 0.5);\n'                      +
        '    if (n >= 0.0 && n < numSpads && \n'                                            +
        '            distance(coord, lastSpad + scanSize / (numSpads - 1.0) * n) <= r) {\n' +
        '        gl_FragColor = uColor;\n'                                                  +
        '    }\n'                                                                           +
        '}\n',

    'scene-base':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 0.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 1.0, isect);\n'           +
        '    // fill\n'                                                                    +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 0.0) {\n'                                                    +
        '        // Bounding box\n'                                                        +
        '        throughput = vec3(0.0);\n'                                                +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else if (isect.mat == 1.0) {\n'                                             +
        '        // Relay wall\n'                                                          +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        // fill\n'                                                                +
        '    }\n'                                                                          +
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
        '    lineIntersect(ray, vec2(0.0, 0.2), vec2(0.0, -0.2), 0.0, isect);\n'           +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
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

    'scene11':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2( 1.2, -1.0), vec2( 1.2,   1.0), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.0, 0.2), vec2(0.0, -0.2), 0.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.0, 0.2), vec2(0.2, 0.54641), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(-0.2, -0.54641), vec2(0.0, -0.2), 0.0, isect);\n'     +
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
        '        throughput *= vec3(0.8);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene12':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 0.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.4,  0.3), vec2(0.4, 1.3), 0.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.7,  1.6), vec2(1.2, 1.1), 0.0, isect);\n'           +
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

    'scene13':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 0.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.4,  0.1), vec2(0.4, 0.8), 0.0, isect);\n'           +
        '    lineIntersect(ray, vec2(1.0,  1.1), vec2(1.2, 0.7), 0.0, isect);\n'           +
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

    'scene14':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2( 1.2, -1.0), vec2( 1.2,   1.0), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.4, 0.2), vec2(0.4, -0.2), 0.0, isect);\n'           +
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

    'scene15':
        '#include "trace-frag"\n\n'                                                          +

        '#include "bsdf"\n'                                                                  +
        '#include "intersect"\n\n'                                                           +

        'void intersect(Ray ray, inout Intersection isect) {\n'                              +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                  +
        '    lineIntersect(ray, vec2( 1.2, -1.0), vec2( 1.2,   1.0), 0.0, isect);\n'         +
        '    // lineIntersect(ray, vec2(0.5, 0.2), vec2(0.4, -0.2), 0.0, isect);\n'          +
        '    lineIntersect(ray, vec2(0.5355, 0.2349), vec2(0.3645, -0.2349), 0.0, isect);\n' +
        '}\n\n'                                                                              +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in'   +
                                             'out vec3 throughput, out float tMult) {\n'     +
        '    tMult = 1.0;\n'                                                                 +
        '    if (isect.mat == 1.0) {\n'                                                      +
        '        float ior = sqrt(sellmeierIor(vec3(1.0396, 0.2318, 1.0105), vec3(0.0060,'   +
                                                         ' 0.0200, 103.56), lambda));\n'     +
        '        if (wiLocal.y < 0.0) {\n'                                                   +
        '            // The ray comes from inside the dielectric material - it will take '   +
                                                                        'longer times\n'     +
        '            tMult = ior;\n'                                                         +
        '        }\n'                                                                        +
        '        return sampleDielectric(state, wiLocal, ior);\n'                            +
        '    } else if (isect.mat == 2.0) {\n'                                               +
        '        return sampleMirror(wiLocal);\n'                                            +
        '    } else if (isect.mat == 3.0) {\n'                                               +
        '        throughput *= vec3(0.0);\n'                                                 +
        '        return sampleDiffuse(state, wiLocal);\n'                                    +
        '    } else {\n'                                                                     +
        '        throughput *= vec3(0.5);\n'                                                 +
        '        return sampleDiffuse(state, wiLocal);\n'                                    +
        '    }\n'                                                                            +
        '}\n',

    'scene16':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2,  0.0), 0.0, isect);\n'          +
        '    lineIntersect(ray, vec2(0.3, -0.2), vec2(0.5, -0.8), 0.0, isect);\n'          +
        '    lineIntersect(ray, vec2(-0.1, 0.1), vec2(1.3,  0.1), 0.0, isect);\n'          +
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

    'scene17':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 3.0, isect);\n\n'              +

        '    // Relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(-1.0, 0.0), vec2(0.0, 0.0), 0.0, isect);\n\n'         +

        '    // Mirror\n'                                                                  +
        '    lineIntersect(ray, vec2(-0.25, 0.75), vec2(0.75, 0.75), 0.0, isect);\n\n'     +

        '    // Hidden object\n'                                                           +
        '    lineIntersect(ray, vec2(1.05, -0.45), vec2(1.45, -0.05), 0.0, isect);\n'      +
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

    'scene18':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 3.0, isect);\n\n'              +

        '    // Relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2,  -0.2), 0.0, isect);\n\n'       +

        '    // Mirror\n'                                                                  +
        '    lineIntersect(ray, vec2(0.4, -0.6), vec2(0.4, 0.2), 0.0, isect);\n\n'         +

        '    // Hidden object\n'                                                           +
        '    lineIntersect(ray, vec2(1.2, 1.0), vec2(1.6, 0.6), 0.0, isect);\n'            +
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
        '        throughput *= vec3(0.8);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene19':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.78, 1.0), 3.0, isect);\n\n'              +

        '    // Relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2,  -0.2), 0.0, isect);\n\n'       +

        '    // Mirror\n'                                                                  +
        '    //lineIntersect(ray, vec2(0.4, -0.6), vec2(0.4, 0.2), 0.0, isect);\n\n'       +

        '    // Hidden object\n'                                                           +
        '    lineIntersect(ray, vec2(-0.4, 1.0), vec2(-0.8, 0.6), 0.0, isect);\n'          +
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
        '        throughput *= vec3(0.8);\n'                                               +
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

    'scene20':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 0.0, isect);\n'           +
        '    bboxIntersect(ray, vec2(-0.1, 0.0), vec2(0.1, 0.2), 0.0, isect);\n'           +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
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

    'scene21':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 0.0, isect);\n'           +
        '    bboxIntersect(ray, vec2(0.1875, 0.25), vec2(0.0625, 0.15), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(-0.325, -0.25), vec2(-0.25, -0.5), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(-0.25, -0.5), vec2(-0.325, -0.75), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(-0.325, -0.75), vec2(-0.575, -0.325), 0.0, isect);\n' +
        '    lineIntersect(ray, vec2(-0.575, -0.325), vec2(-0.325, -0.25), 0.0, isect);\n' +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
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

    'scene22':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 0.0, isect);\n\n'         +

        '    lineIntersect(ray, vec2(0.0, 0.4), vec2(0.2, 0.0), 0.0, isect);\n'            +
        '    lineIntersect(ray, vec2(0.2, 0.0), vec2(0.0, -0.4), 0.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.0, -0.4), vec2(0.0, 0.4), 0.0, isect);\n'           +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 1.0) {\n'                                                    +
        '        return sampleRoughMirror(state, wiLocal, throughput, 0.5);\n'             +
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

    'scene23-bunny-head':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 0.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 1.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.5499999999999999, 0.4), vec2(0.6, 0.38), 1.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.6, 0.38), vec2(0.6599999999999999, 0.3), 1.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.6599999999999999, 0.3), vec2(0.69, 0.24), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.69, 0.24), vec2(0.75, 0.24), 1.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.75, 0.24), vec2(0.7999999999999999, 0.22), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.7999999999999999, 0.22), vec2(0.82, 0.2), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.82, 0.2), vec2(0.85, 0.16), 1.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.85, 0.16), vec2(0.8699999999999999, 0.125), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.8699999999999999, 0.125), vec2(0.875, 0.1), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.875, 0.1), vec2(0.8699999999999999, 0.08), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.8699999999999999, 0.08), vec2(0.8799999999999999, ' +
                                                                 '0.06), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8799999999999999, 0.06), vec2(0.8699999999999999, ' +
                                                                 '0.04), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8699999999999999, 0.04), vec2(0.8599999999999999, ' +
                                                                 '0.02), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8599999999999999, 0.02), vec2(0.84, 0.0), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.84, 0.0), vec2(0.61, 0.08), 1.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.61, 0.08), vec2(0.61, 0.1), 1.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.61, 0.1), vec2(0.615, 0.15), 1.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.615, 0.15), vec2(0.605, 0.165), 1.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.605, 0.165), vec2(0.48, 0.2), 1.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.48, 0.2), vec2(0.3999999999999999, 0.25), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.3999999999999999, 0.25), vec2(0.38, 0.32), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38, 0.32), vec2(0.3899999999999999, 0.36), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.3899999999999999, 0.36), vec2(0.4099999999999999, ' +
                                                                 '0.37), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4099999999999999, 0.37), vec2(0.49, 0.32), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.49, 0.32), vec2(0.5499999999999999, 0.3), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.5499999999999999, 0.3), vec2(0.5299999999999999, 0' +
                                                                  '.32), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5299999999999999, 0.32), vec2(0.5199999999999999, ' +
                                                                 '0.35), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5199999999999999, 0.35), vec2(0.5299999999999999, ' +
                                                                 '0.39), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5299999999999999, 0.39), vec2(0.5499999999999999, ' +
                                                                  '0.4), 1.0, isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 0.0) {\n'                                                    +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene24-bunny':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 0.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 1.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.61, 0.08), vec2(0.61, 0.1), 1.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.61, 0.1), vec2(0.615, 0.15), 1.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.615, 0.15), vec2(0.605, 0.165), 1.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.605, 0.165), vec2(0.48, 0.2), 1.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.48, 0.2), vec2(0.3999999999999999, 0.25), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.3999999999999999, 0.25), vec2(0.38, 0.32), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38, 0.32), vec2(0.3899999999999999, 0.36), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.3899999999999999, 0.36), vec2(0.4099999999999999, ' +
                                                                 '0.37), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4099999999999999, 0.37), vec2(0.49, 0.32), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.49, 0.32), vec2(0.5499999999999999, 0.3), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.5499999999999999, 0.3), vec2(0.5299999999999999, 0' +
                                                                  '.32), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5299999999999999, 0.32), vec2(0.5199999999999999, ' +
                                                                 '0.35), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5199999999999999, 0.35), vec2(0.5299999999999999, ' +
                                                                 '0.39), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5299999999999999, 0.39), vec2(0.5499999999999999, ' +
                                                                  '0.4), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5499999999999999, 0.4), vec2(0.6, 0.38), 1.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.6, 0.38), vec2(0.6599999999999999, 0.3), 1.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.6599999999999999, 0.3), vec2(0.69, 0.24), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.69, 0.24), vec2(0.75, 0.24), 1.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.75, 0.24), vec2(0.7999999999999999, 0.22), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.7999999999999999, 0.22), vec2(0.82, 0.2), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.82, 0.2), vec2(0.85, 0.16), 1.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.85, 0.16), vec2(0.8699999999999999, 0.125), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.8699999999999999, 0.125), vec2(0.875, 0.1), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.875, 0.1), vec2(0.8699999999999999, 0.08), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.8699999999999999, 0.08), vec2(0.8799999999999999, ' +
                                                                 '0.06), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8799999999999999, 0.06), vec2(0.8699999999999999, ' +
                                                                 '0.04), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8699999999999999, 0.04), vec2(0.8599999999999999, ' +
                                                                 '0.02), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8599999999999999, 0.02), vec2(0.84, 0.0), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.84, 0.0), vec2(0.835, -0.005), 1.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.835, -0.005), vec2(0.838, -0.01), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.838, -0.01), vec2(0.838, -0.02), 1.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.838, -0.02), vec2(0.847, -0.03), 1.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.847, -0.03), vec2(0.853, -0.045), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.853, -0.045), vec2(0.865, -0.05), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.865, -0.05), vec2(0.8699999999999999, -0.06), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.8699999999999999, -0.06), vec2(0.8799999999999999,' +
                                                               ' -0.07), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8799999999999999, -0.07), vec2(0.8899999999999999,' +
                                                              ' -0.087), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8899999999999999, -0.087), vec2(0.8919999999999999' +
                                                               ', -0.1), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8919999999999999, -0.1), vec2(0.895, -0.135), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.895, -0.135), vec2(0.8979999999999999, -0.137), 1.' +
                                                                          '0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8979999999999999, -0.137), vec2(0.8979999999999999' +
                                                              ', -0.15), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8979999999999999, -0.15), vec2(0.8999999999999999,' +
                                                               ' -0.17), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8999999999999999, -0.17), vec2(0.9019999999999999,' +
                                                               ' -0.18), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.9019999999999999, -0.18), vec2(0.8999999999999999,' +
                                                              ' -0.186), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8999999999999999, -0.186), vec2(0.8979999999999999' +
                                                             ', -0.192), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8979999999999999, -0.192), vec2(0.8899999999999999' +
                                                              ', -0.21), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8899999999999999, -0.21), vec2(0.8899999999999999,' +
                                                               ' -0.22), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8899999999999999, -0.22), vec2(0.891, -0.24), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.891, -0.24), vec2(0.8799999999999999, -0.265), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8799999999999999, -0.265), vec2(0.883, -0.28), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.883, -0.28), vec2(0.883, -0.29), 1.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.883, -0.29), vec2(0.875, -0.3), 1.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.875, -0.3), vec2(0.8599999999999999, -0.32), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.8599999999999999, -0.32), vec2(0.875, -0.33), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.875, -0.33), vec2(0.879, -0.34), 1.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.879, -0.34), vec2(0.8799999999999999, -0.35), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.8799999999999999, -0.35), vec2(0.8799999999999999,' +
                                                              ' -0.375), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8799999999999999, -0.375), vec2(0.8779999999999999' +
                                                              ', -0.38), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8779999999999999, -0.38), vec2(0.8739999999999999,' +
                                                               ' -0.38), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8739999999999999, -0.38), vec2(0.873, -0.383), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.873, -0.383), vec2(0.8599999999999999, -0.387), 1.' +
                                                                          '0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8599999999999999, -0.387), vec2(0.845, -0.387), 1.' +
                                                                          '0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.845, -0.387), vec2(0.835, -0.39), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.835, -0.39), vec2(0.76, -0.395), 1.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.76, -0.395), vec2(0.725, -0.398), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.725, -0.398), vec2(0.71, -0.396), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.71, -0.396), vec2(0.6399999999999999, -0.398), 1.0' +
                                                                           ', isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 0.0) {\n'                                                    +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    }\n'                                                                          +
        '}\n',

    'scene25-mirror-bunny':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 0.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 2.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.61, 0.08), vec2(0.61, 0.1), 1.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.61, 0.1), vec2(0.615, 0.15), 1.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.615, 0.15), vec2(0.605, 0.165), 1.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.605, 0.165), vec2(0.48, 0.2), 1.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.48, 0.2), vec2(0.3999999999999999, 0.25), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.3999999999999999, 0.25), vec2(0.38, 0.32), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38, 0.32), vec2(0.3899999999999999, 0.36), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.3899999999999999, 0.36), vec2(0.4099999999999999, ' +
                                                                 '0.37), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4099999999999999, 0.37), vec2(0.49, 0.32), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.49, 0.32), vec2(0.5499999999999999, 0.3), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.5499999999999999, 0.3), vec2(0.5299999999999999, 0' +
                                                                  '.32), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5299999999999999, 0.32), vec2(0.5199999999999999, ' +
                                                                 '0.35), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5199999999999999, 0.35), vec2(0.5299999999999999, ' +
                                                                 '0.39), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5299999999999999, 0.39), vec2(0.5499999999999999, ' +
                                                                  '0.4), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5499999999999999, 0.4), vec2(0.6, 0.38), 1.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.6, 0.38), vec2(0.6599999999999999, 0.3), 1.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.6599999999999999, 0.3), vec2(0.69, 0.24), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.69, 0.24), vec2(0.75, 0.24), 1.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.75, 0.24), vec2(0.7999999999999999, 0.22), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.7999999999999999, 0.22), vec2(0.82, 0.2), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.82, 0.2), vec2(0.85, 0.16), 1.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.85, 0.16), vec2(0.8699999999999999, 0.125), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.8699999999999999, 0.125), vec2(0.875, 0.1), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.875, 0.1), vec2(0.8699999999999999, 0.08), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.8699999999999999, 0.08), vec2(0.8799999999999999, ' +
                                                                 '0.06), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8799999999999999, 0.06), vec2(0.8699999999999999, ' +
                                                                 '0.04), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8699999999999999, 0.04), vec2(0.8599999999999999, ' +
                                                                 '0.02), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8599999999999999, 0.02), vec2(0.84, 0.0), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.84, 0.0), vec2(0.835, -0.005), 1.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.835, -0.005), vec2(0.838, -0.01), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.838, -0.01), vec2(0.838, -0.02), 1.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.838, -0.02), vec2(0.847, -0.03), 1.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.847, -0.03), vec2(0.853, -0.045), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.853, -0.045), vec2(0.865, -0.05), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.865, -0.05), vec2(0.8699999999999999, -0.06), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.8699999999999999, -0.06), vec2(0.8799999999999999,' +
                                                               ' -0.07), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8799999999999999, -0.07), vec2(0.8899999999999999,' +
                                                              ' -0.087), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8899999999999999, -0.087), vec2(0.8919999999999999' +
                                                               ', -0.1), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8919999999999999, -0.1), vec2(0.895, -0.135), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.895, -0.135), vec2(0.8979999999999999, -0.137), 1.' +
                                                                          '0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8979999999999999, -0.137), vec2(0.8979999999999999' +
                                                              ', -0.15), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8979999999999999, -0.15), vec2(0.8999999999999999,' +
                                                               ' -0.17), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8999999999999999, -0.17), vec2(0.9019999999999999,' +
                                                               ' -0.18), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.9019999999999999, -0.18), vec2(0.8999999999999999,' +
                                                              ' -0.186), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8999999999999999, -0.186), vec2(0.8979999999999999' +
                                                             ', -0.192), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8979999999999999, -0.192), vec2(0.8899999999999999' +
                                                              ', -0.21), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8899999999999999, -0.21), vec2(0.8899999999999999,' +
                                                               ' -0.22), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8899999999999999, -0.22), vec2(0.891, -0.24), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.891, -0.24), vec2(0.8799999999999999, -0.265), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8799999999999999, -0.265), vec2(0.883, -0.28), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.883, -0.28), vec2(0.883, -0.29), 1.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.883, -0.29), vec2(0.875, -0.3), 1.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.875, -0.3), vec2(0.8599999999999999, -0.32), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.8599999999999999, -0.32), vec2(0.875, -0.33), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.875, -0.33), vec2(0.879, -0.34), 1.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.879, -0.34), vec2(0.8799999999999999, -0.35), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.8799999999999999, -0.35), vec2(0.8799999999999999,' +
                                                              ' -0.375), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8799999999999999, -0.375), vec2(0.8779999999999999' +
                                                              ', -0.38), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8779999999999999, -0.38), vec2(0.8739999999999999,' +
                                                               ' -0.38), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8739999999999999, -0.38), vec2(0.873, -0.383), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.873, -0.383), vec2(0.8599999999999999, -0.387), 1.' +
                                                                          '0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8599999999999999, -0.387), vec2(0.845, -0.387), 1.' +
                                                                          '0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.845, -0.387), vec2(0.835, -0.39), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.835, -0.39), vec2(0.76, -0.395), 1.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.76, -0.395), vec2(0.725, -0.398), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.725, -0.398), vec2(0.71, -0.396), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.71, -0.396), vec2(0.6399999999999999, -0.398), 1.0' +
                                                                           ', isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 0.0) {\n'                                                    +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else if (isect.mat == 2.0) {\n'                                             +
        '        throughput *= vec3(0.5);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
        '    } else {\n'                                                                   +
        '        return sampleMirror(wiLocal);\n'                                          +
        '    }\n'                                                                          +
        '}\n',

    'scene26-smooth-bunny':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 0.0, isect);\n'                +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, 1.0), 1.0, isect);\n'           +
        '    lineIntersect(ray, vec2(0.8206739999999999, 0.198216), vec2(0.815566, 0.2033' +
                                                                   '42), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.574719, -0.39353), vec2(0.576287, -0.393524), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.815566, 0.203342), vec2(0.810534, 0.208006), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.478313, -0.11591), vec2(0.48021899999999995, -0.11' +
                                                                 '0733), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.431303, 0.223654), vec2(0.429651, 0.224844), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.7673829999999999, -0.392205), vec2(0.766969, -0.39' +
                                                                 '2324), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.523787, -0.331268), vec2(0.523708, -0.331167), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.858198, -0.047289), vec2(0.86227, -0.049948), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.603587, -0.395019), vec2(0.6040589999999999, -0.39' +
                                                                 '5049), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.894415, -0.12157), vec2(0.8936089999999999, -0.114' +
                                                                  '564), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6040589999999999, -0.395049), vec2(0.6052109999999' +
                                                       '999, -0.395277), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8763259999999999, 0.0736), vec2(0.875251, 0.080882' +
                                                                     '), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8250519999999999, -0.390514), vec2(0.821863, -0.39' +
                                                                 '0445), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.609435, 0.130471), vec2(0.6103179999999999, 0.1380' +
                                                                   '74), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.897988, -0.156566), vec2(0.897009, -0.153703), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.7423219999999999, 0.237806), vec2(0.74393599999999' +
                                                         '99, 0.237578), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.379108, 0.334827), vec2(0.379108, 0.334794), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.5299659999999999, -0.39328), vec2(0.52978799999999' +
                                                        '99, -0.393263), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.565152, 0.034239), vec2(0.568762, 0.039782), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.50708, -0.067216), vec2(0.5100429999999999, -0.065' +
                                                                  '493), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.858198, -0.047289), vec2(0.8553459999999999, -0.04' +
                                                                 '6413), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8785529999999999, -0.34331), vec2(0.879782, -0.350' +
                                                                  '252), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.580668, -0.393746), vec2(0.576967, -0.393558), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.7673829999999999, -0.392205), vec2(0.7673989999999' +
                                                       '999, -0.392204), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.528434, 0.321658), vec2(0.5323509999999999, 0.3163' +
                                                                   '82), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.44313199999999997, 0.34892), vec2(0.438446, 0.3527' +
                                                                    '1), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.540993, -0.03681), vec2(0.540744, -0.045676), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.766097, -0.392574), vec2(0.766905, -0.392346), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.817371, -0.390734), vec2(0.818827, -0.390556), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.431994, 0.357087), vec2(0.433453, 0.356124), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.553245, 0.29435), vec2(0.554781, 0.293478), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.8096509999999999, -0.390906), vec2(0.811364, -0.39' +
                                                                 '0814), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.44985299999999995, 0.344915), vec2(0.4523669999999' +
                                                       '9996, 0.342801), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.469441, 0.332418), vec2(0.471055, 0.331682), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.540993, -0.03681), vec2(0.5424859999999999, -0.031' +
                                                                   '75), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.553245, 0.29435), vec2(0.548137, 0.297074), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.891573, -0.23561), vec2(0.8913039999999999, -0.232' +
                                                                  '274), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.475086, -0.14453), vec2(0.4755959999999999, -0.146' +
                                                                  '364), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.546716, 0.298082), vec2(0.548137, 0.297074), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.5147219999999999, 0.312555), vec2(0.50949899999999' +
                                                         '99, 0.314078), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.489259, 0.322138), vec2(0.493054, 0.320154), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.4766229999999999, -0.181434), vec2(0.4772379999999' +
                                                      '9994, -0.188713), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.843143, -0.386071), vec2(0.8431249999999999, -0.38' +
                                                                 '6072), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.513389, -0.063084), vec2(0.513413, -0.063073), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.518218, -0.059718), vec2(0.51791, -0.059974), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.54879, 0.298294), vec2(0.543412, 0.303896), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.894261, -0.199976), vec2(0.897565, -0.192602), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.4980549999999999, -0.076729), vec2(0.5023559999999' +
                                                       '999, -0.071696), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8528209999999999, 0.007771), vec2(0.847482, 0.0047' +
                                                                   '82), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.546716, 0.298082), vec2(0.541531, 0.300715), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.589155, 0.06539), vec2(0.5941099999999999, 0.06945' +
                                                                    '8), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8509769999999999, -0.036604), vec2(0.850938, -0.03' +
                                                                 '6514), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5295099999999999, -0.052594), vec2(0.524596, -0.05' +
                                                                 '6015), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.45941699999999996, 0.206846), vec2(0.4574579999999' +
                                                        '999, 0.207959), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.45941699999999996, 0.206846), vec2(0.4662529999999' +
                                                        '999, 0.203999), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.59242, 0.388496), vec2(0.585982, 0.391856), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.475086, -0.14453), vec2(0.4751559999999999, -0.140' +
                                                                  '198), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.796132, -0.391346), vec2(0.8030839999999999, -0.39' +
                                                                 '1357), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.556279, 0.014435), vec2(0.5585, 0.017285), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.50708, -0.067216), vec2(0.505234, -0.069281), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.513303, -0.391705), vec2(0.514608, -0.392258), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8250519999999999, -0.390514), vec2(0.825358, -0.39' +
                                                                 '0431), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.523211, 0.381379), vec2(0.5215209999999999, 0.3787' +
                                                                   '16), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.523787, -0.331268), vec2(0.524107, -0.331405), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.514377, -0.362104), vec2(0.5142399999999999, -0.36' +
                                                                 '5158), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.513303, -0.391705), vec2(0.5111399999999999, -0.38' +
                                                                 '4584), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.523864, -0.332673), vec2(0.524011, -0.332309), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.607116, -0.395373), vec2(0.607618, -0.395455), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.5323509999999999, 0.316382), vec2(0.53413499999999' +
                                                         '99, 0.314302), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6454529999999999, -0.396474), vec2(0.645602, -0.39' +
                                                                 '6475), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.523941, -0.056344), vec2(0.524596, -0.056015), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.5961449999999999, -0.394471), vec2(0.5959409999999' +
                                                       '999, -0.394428), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8829309999999999, -0.071796), vec2(0.879222, -0.06' +
                                                                 '6635), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.704684, -0.395058), vec2(0.708739, -0.395012), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.647208, 0.319839), vec2(0.646917, 0.320197), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.8829309999999999, -0.071796), vec2(0.8842939999999' +
                                                       '999, -0.074425), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.552055, 0.401813), vec2(0.5494249999999999, 0.4004' +
                                                                   '45), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5469849999999999, -0.016876), vec2(0.5471389999999' +
                                                       '999, -0.009413), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6103179999999999, -0.395898), vec2(0.616713, -0.39' +
                                                                 '5954), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.722428, 0.237835), vec2(0.720815, 0.237831), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.863065, -0.317053), vec2(0.8637269999999999, -0.31' +
                                                                 '6031), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.535885, -0.050058), vec2(0.5372509999999999, -0.04' +
                                                                 '9286), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.580668, -0.393746), vec2(0.5826439999999999, -0.39' +
                                                                 '3763), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.509597, -0.305223), vec2(0.5096849999999999, -0.30' +
                                                                 '5385), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8364469999999999, -0.015215), vec2(0.836452, -0.01' +
                                                                  '531), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.817371, -0.390734), vec2(0.8154539999999999, -0.39' +
                                                                 '0718), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.489259, 0.322138), vec2(0.487201, 0.322787), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.865034, -0.051302), vec2(0.870142, -0.055548), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.431303, 0.223654), vec2(0.437179, 0.21985), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.518218, -0.059718), vec2(0.5185909999999999, -0.05' +
                                                                 '9539), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.894415, -0.12157), vec2(0.8945179999999999, -0.123' +
                                                                  '488), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8748659999999999, -0.302374), vec2(0.877831, -0.29' +
                                                                 '7929), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8992549999999999, -0.163616), vec2(0.898928, -0.16' +
                                                                 '2134), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8492489999999999, -0.386014), vec2(0.8496859999999' +
                                                        '999, -0.38584), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.469441, 0.332418), vec2(0.46499099999999993, 0.335' +
                                                                     '), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8749039999999999, 0.03733), vec2(0.874865999999999' +
                                                          '9, 0.037238), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4861869999999999, -0.239777), vec2(0.486178, -0.23' +
                                                                 '9712), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.607015, 0.373355), vec2(0.608706, 0.372347), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.5108999999999999, -0.064873), vec2(0.511478, -0.06' +
                                                                 '4455), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.514377, -0.362104), vec2(0.515338, -0.354822), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.6111249999999999, 0.368752), vec2(0.608706, 0.3723' +
                                                                   '47), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.609435, 0.130471), vec2(0.609281, 0.122916), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.868068, -0.384886), vec2(0.866073, -0.385117), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8866189999999999, -0.078754), vec2(0.889653, -0.08' +
                                                                 '5898), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6681549999999999, -0.395772), vec2(0.668296, -0.39' +
                                                                 '5764), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.515952, -0.322665), vec2(0.514898, -0.318372), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.59242, 0.168882), vec2(0.590312, 0.169894), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.545372, -0.022257), vec2(0.5468679999999999, -0.01' +
                                                                 '7814), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.545372, -0.022257), vec2(0.544161, -0.026206), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.776839, -0.391713), vec2(0.776566, -0.391698), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.412033, 0.241775), vec2(0.40883099999999994, 0.245' +
                                                                  '267), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5396369999999999, -0.047377), vec2(0.539767, -0.04' +
                                                                 '7351), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5396369999999999, -0.047377), vec2(0.5394359999999' +
                                                       '999, -0.047606), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6744199999999999, -0.39551), vec2(0.676653, -0.395' +
                                                                  '396), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7493509999999999, 0.236883), vec2(0.75096499999999' +
                                                         '99, 0.236703), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.854584, -0.046098), vec2(0.853691, -0.045676), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.5640759999999999, 0.401994), vec2(0.568031, 0.3999' +
                                                                   '99), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6066689999999999, 0.08505), vec2(0.606055, 0.09260' +
                                                                    '6), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.521636, -0.33063), vec2(0.521598, -0.330586), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.5108999999999999, -0.064873), vec2(0.5100429999999' +
                                                       '999, -0.065493), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.529218, -0.393213), vec2(0.52918, -0.393211), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.4810399999999999, -0.217885), vec2(0.4818249999999' +
                                                      '9995, -0.222138), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5140699999999999, -0.366529), vec2(0.51311, -0.375' +
                                                                  '948), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.873453, -0.382612), vec2(0.873248, -0.38262), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.377764, 0.320794), vec2(0.378339, 0.311454), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.6178159999999999, -0.395962), vec2(0.6177809999999' +
                                                       '999, -0.395956), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.523211, 0.381379), vec2(0.5249389999999999, 0.3840' +
                                                                   '71), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6103179999999999, 0.138074), vec2(0.611393, 0.1455' +
                                                                   '82), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.9002539999999999, -0.17076), vec2(0.90025399999999' +
                                                         '99, -0.17795), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.388825, 0.362431), vec2(0.391864, 0.363565), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.8352679999999999, 0.181767), vec2(0.840568, 0.1744' +
                                                                   '86), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.523134, -0.331086), vec2(0.523708, -0.331167), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8721779999999999, -0.383462), vec2(0.8727719999999' +
                                                       '999, -0.382995), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8820479999999999, -0.26533), vec2(0.882795, -0.262' +
                                                                  '113), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8764029999999999, 0.087847), vec2(0.87615899999999' +
                                                          '99, 0.08688), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4980549999999999, -0.076729), vec2(0.497718, -0.07' +
                                                                 '7228), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6029829999999999, 0.078466), vec2(0.600283, 0.0742' +
                                                                   '66), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.653872, 0.309484), vec2(0.652763, 0.310916), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.620112, 0.358326), vec2(0.621188, 0.356454), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.516413, -0.060976), vec2(0.51791, -0.059974), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.853205, -0.043518), vec2(0.853525, -0.045308), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.47646999999999995, -0.152442), vec2(0.476469999999' +
                                                     '99995, -0.152443), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6681549999999999, -0.395772), vec2(0.6680189999999' +
                                                       '999, -0.395745), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8777469999999999, -0.340536), vec2(0.877113, -0.33' +
                                                                 '8757), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.516681, 0.357586), vec2(0.517489, 0.365638), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.581743, 0.054488), vec2(0.581024, 0.053354), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.8399159999999999, 0.000272), vec2(0.84422099999999' +
                                                          '99, 0.00375), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6287919999999999, -0.396634), vec2(0.6214569999999' +
                                                        '999, -0.39657), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6088199999999999, 0.115314), vec2(0.609281, 0.1229' +
                                                                   '16), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.605248, -0.39548), vec2(0.60666, -0.395399), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.8757109999999999, -0.381342), vec2(0.8741159999999' +
                                                        '999, -0.38217), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8367789999999999, -0.018299), vec2(0.8367829999999' +
                                                       '999, -0.018415), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5394359999999999, -0.047606), vec2(0.5372509999999' +
                                                       '999, -0.049286), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8827019999999999, -0.28708), vec2(0.880166, -0.294' +
                                                                  '634), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.45208099999999996, 0.211982), vec2(0.4574579999999' +
                                                        '999, 0.207959), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.649493, -0.396722), vec2(0.6484949999999999, -0.39' +
                                                                 '6674), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.704531, 0.237066), vec2(0.7007789999999999, 0.2366' +
                                                                   '97), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7932509999999999, -0.391388), vec2(0.788351, -0.39' +
                                                                 '1412), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.653872, 0.309484), vec2(0.6555639999999999, 0.3061' +
                                                                   '37), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.48219199999999995, -0.225074), vec2(0.483595999999' +
                                                      '9999, -0.230126), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.846675, -0.029732), vec2(0.8506589999999999, -0.03' +
                                                                 '6096), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.385022, 0.284403), vec2(0.387903, 0.27699), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.44985299999999995, 0.344915), vec2(0.4448149999999' +
                                                       '9996, 0.347601), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.385022, 0.284403), vec2(0.3835179999999999, 0.2911' +
                                                                   '26), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.45208099999999996, 0.211982), vec2(0.4474349999999' +
                                                        '999, 0.214457), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4766229999999999, -0.181434), vec2(0.4766229999999' +
                                                       '999, -0.179087), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.493753, -0.081953), vec2(0.49021799999999993, -0.0' +
                                                                '87488), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.627563, 0.349095), vec2(0.624683, 0.352642), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.37787799999999994, 0.329434), vec2(0.377764, 0.320' +
                                                                  '794), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.858044, 0.145683), vec2(0.8546, 0.151689), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.528434, 0.321658), vec2(0.5275059999999999, 0.3241' +
                                                                   '83), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6471619999999999, -0.396574), vec2(0.645602, -0.39' +
                                                                 '6475), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.521598, 0.190994), vec2(0.524909, 0.190416), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.59539, -0.394427), vec2(0.5959409999999999, -0.394' +
                                                                  '428), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7233499999999999, -0.397677), vec2(0.708739, -0.39' +
                                                                 '5012), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.49598, 0.319282), vec2(0.49971999999999994, 0.3175' +
                                                                   '94), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.493753, -0.081953), vec2(0.497718, -0.077228), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.572757, 0.044958), vec2(0.577109, 0.049351), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.620112, 0.358326), vec2(0.6184919999999999, 0.3596' +
                                                                   '83), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6176539999999999, -0.395962), vec2(0.616713, -0.39' +
                                                                 '5954), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.649493, -0.396722), vec2(0.652509, -0.396502), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.51891, -0.393094), vec2(0.5191079999999999, -0.393' +
                                                                  '112), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7932509999999999, -0.391388), vec2(0.7937449999999' +
                                                       '999, -0.391358), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.607618, -0.395455), vec2(0.6075429999999999, -0.39' +
                                                                 '5349), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.775844, -0.391726), vec2(0.775288, -0.391704), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8763259999999999, -0.380696), vec2(0.8800509999999' +
                                                        '999, -0.37595), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8763259999999999, -0.380696), vec2(0.8757109999999' +
                                                       '999, -0.381342), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7839179999999999, 0.225604), vec2(0.784411, 0.2253' +
                                                                   '84), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.516413, -0.060976), vec2(0.5178619999999999, -0.06' +
                                                                 '0014), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5573549999999999, 0.179863), vec2(0.559429, 0.1793' +
                                                                   '03), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.836729, -0.016712), vec2(0.8367789999999999, -0.01' +
                                                                 '8299), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8912329999999999, -0.231397), vec2(0.8913039999999' +
                                                       '999, -0.232274), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7096389999999999, 0.237366), vec2(0.704962, 0.2370' +
                                                                   '56), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.704531, 0.237066), vec2(0.7048429999999999, 0.2370' +
                                                                   '48), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.872101, -0.326572), vec2(0.871281, -0.32564), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.6976169999999999, -0.395186), vec2(0.694781, -0.39' +
                                                                 '5089), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.640967, 0.328918), vec2(0.6389309999999999, 0.3331' +
                                                                   '14), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.518678, -0.059487), vec2(0.5185909999999999, -0.05' +
                                                                 '9539), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6817249999999999, 0.256026), vec2(0.681657, 0.2561' +
                                                                   '24), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8540869999999999, -0.385834), vec2(0.851569, -0.38' +
                                                                  '578), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.85985, -0.385798), vec2(0.8605039999999999, -0.385' +
                                                                  '536), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8605039999999999, -0.385536), vec2(0.86053, -0.385' +
                                                                  '526), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8912329999999999, -0.231397), vec2(0.8912329999999' +
                                                       '999, -0.231378), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7493509999999999, 0.236883), vec2(0.74635499999999' +
                                                         '99, 0.237267), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7352559999999999, 0.238264), vec2(0.738594, 0.2379' +
                                                                   '26), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.863652, -0.385433), vec2(0.8633679999999999, -0.38' +
                                                                 '5431), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8280099999999999, -0.390472), vec2(0.8328059999999' +
                                                       '999, -0.389986), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.87767, 0.051846), vec2(0.8770169999999999, 0.04461' +
                                                                     '), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.539188, 0.396611), vec2(0.534771, 0.392988), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.865034, -0.051302), vec2(0.86227, -0.049948), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.5469849999999999, -0.016876), vec2(0.5468679999999' +
                                                       '999, -0.017814), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4140959999999999, 0.23931), vec2(0.412033, 0.24177' +
                                                                    '5), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.873983, 0.109646), vec2(0.8756729999999999, 0.1024' +
                                                                   '12), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.38905499999999993, 0.274728), vec2(0.387903, 0.276' +
                                                                   '99), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8777469999999999, -0.340536), vec2(0.8785529999999' +
                                                        '999, -0.34331), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.87767, 0.051846), vec2(0.878015, 0.059175), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.767172, 0.232606), vec2(0.77255, 0.230944), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.666546, 0.285768), vec2(0.664438, 0.289486), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.8909969999999999, -0.24271), vec2(0.888501, -0.250' +
                                                                  '174), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7096389999999999, 0.237366), vec2(0.71517, 0.23755' +
                                                                    '1), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.549558, 0.002654), vec2(0.55263, 0.0088), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.704684, -0.395058), vec2(0.6976169999999999, -0.39' +
                                                                 '5186), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.676653, -0.395396), vec2(0.676751, -0.395391), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.722428, 0.237835), vec2(0.722556, 0.237832), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.666546, 0.285768), vec2(0.66691, 0.284705), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.3847529999999999, 0.358448), vec2(0.38386699999999' +
                                                        '996, 0.354003), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8805499999999999, -0.365192), vec2(0.8808959999999' +
                                                       '999, -0.368784), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.617817, -0.395962), vec2(0.6178159999999999, -0.39' +
                                                                 '5962), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6176539999999999, -0.395962), vec2(0.617749, -0.39' +
                                                                 '5958), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5993339999999999, 0.073335), vec2(0.600283, 0.0742' +
                                                                   '66), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5199079999999999, -0.393186), vec2(0.525845, -0.39' +
                                                                 '3089), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.836729, -0.016712), vec2(0.8365469999999999, -0.01' +
                                                                  '582), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.875121, 0.081383), vec2(0.875116, 0.081402), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.462835, 0.336478), vec2(0.4612219999999999, 0.3372' +
                                                                   '14), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5249389999999999, 0.384071), vec2(0.529241, 0.3889' +
                                                                    '3), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.607015, 0.373355), vec2(0.602499, 0.376443), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.478313, -0.11591), vec2(0.476892, -0.122962), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.40145999999999993, 0.367227), vec2(0.3979269999999' +
                                                        '999, 0.365899), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.568762, 0.039782), vec2(0.572757, 0.044958), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.581743, 0.054488), vec2(0.585239, 0.060174), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.525845, -0.393089), vec2(0.526285, -0.393082), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.853205, -0.043518), vec2(0.8509769999999999, -0.03' +
                                                                 '6604), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8145669999999999, -0.390773), vec2(0.8124939999999' +
                                                       '999, -0.390755), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6098889999999999, 0.157346), vec2(0.61049899999999' +
                                                         '99, 0.155727), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.59242, 0.168882), vec2(0.594495, 0.16823), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.847482, 0.004782), vec2(0.8442209999999999, 0.0037' +
                                                                    '5), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.48995, -0.254797), vec2(0.491012, -0.257722), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.671315, 0.274363), vec2(0.6727989999999999, 0.2718' +
                                                                   '22), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.379108, 0.334827), vec2(0.37995199999999996, 0.341' +
                                                                  '198), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6330169999999999, 0.341122), vec2(0.63000099999999' +
                                                          '99, 0.34348), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8741159999999999, -0.38217), vec2(0.873248, -0.382' +
                                                                   '62), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.38317899999999994, 0.291926), vec2(0.3823339999999' +
                                                       '9995, 0.294094), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8748009999999999, 0.037115), vec2(0.87478799999999' +
                                                         '99, 0.037088), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.871372, -0.383782), vec2(0.8721779999999999, -0.38' +
                                                                 '3462), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.868721, 0.124254), vec2(0.865456, 0.131351), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.868145, -0.310029), vec2(0.8691309999999999, -0.30' +
                                                                 '8435), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.792368, 0.221547), vec2(0.7935939999999999, 0.2207' +
                                                                   '89), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.543951, 0.183146), vec2(0.536922, 0.186462), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.521598, -0.330586), vec2(0.515952, -0.322665), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.524208, -0.331537), vec2(0.524262, -0.331608), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.872101, -0.326572), vec2(0.872314, -0.327094), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.559083, 0.02112), vec2(0.5585, 0.017285), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.5162209999999999, -0.39323), vec2(0.514608, -0.392' +
                                                                  '258), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.767172, 0.232606), vec2(0.761873, 0.234314), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.8761589999999999, 0.08688), vec2(0.875116, 0.08140' +
                                                                    '2), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.524208, -0.331537), vec2(0.524107, -0.331405), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.44340099999999993, 0.21627), vec2(0.44743499999999' +
                                                         '99, 0.214457), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.696645, 0.236344), vec2(0.696658, 0.236345), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.696645, 0.236344), vec2(0.6965279999999999, 0.2363' +
                                                                   '71), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8827019999999999, -0.28708), vec2(0.882922, -0.283' +
                                                                  '863), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.524747, 0.329047), vec2(0.5275059999999999, 0.3241' +
                                                                   '83), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.889653, -0.085898), vec2(0.891458, -0.092906), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.6330169999999999, 0.341122), vec2(0.63374, 0.33870' +
                                                                    '7), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.589155, 0.06539), vec2(0.58527, 0.060211), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.868145, -0.310029), vec2(0.8637269999999999, -0.31' +
                                                                 '6031), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5993339999999999, 0.073335), vec2(0.598196, 0.0724' +
                                                                   '57), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.54879, 0.298294), vec2(0.5495359999999999, 0.29800' +
                                                                    '1), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6052109999999999, -0.395277), vec2(0.6052179999999' +
                                                       '999, -0.395319), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.688746, -0.395446), vec2(0.6930609999999999, -0.39' +
                                                                 '5131), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.580668, 0.173286), vec2(0.5751689999999999, 0.1751' +
                                                                   '96), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.766905, -0.392346), vec2(0.766969, -0.392324), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.775288, -0.391704), vec2(0.774154, -0.39171), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.8950689999999999, -0.128804), vec2(0.896106, -0.13' +
                                                                 '5856), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8145669999999999, -0.390773), vec2(0.8154539999999' +
                                                       '999, -0.390718), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8353459999999999, -0.389882), vec2(0.8328059999999' +
                                                       '999, -0.389986), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5596979999999999, 0.402323), vec2(0.56407599999999' +
                                                         '99, 0.401994), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6066689999999999, 0.08505), vec2(0.606893999999999' +
                                                          '9, 0.082714), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6029829999999999, 0.078466), vec2(0.606885, 0.0827' +
                                                                   '05), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.888501, -0.250174), vec2(0.884859, -0.256726), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.539188, 0.396611), vec2(0.544488, 0.399698), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.4861869999999999, -0.239777), vec2(0.4878389999999' +
                                                       '999, -0.247241), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5494049999999999, -0.394004), vec2(0.5437639999999' +
                                                       '999, -0.393753), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.880166, -0.294634), vec2(0.877831, -0.297929), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.47739699999999996, -0.189448), vec2(0.477388999999' +
                                                     '99995, -0.189409), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8206739999999999, 0.198216), vec2(0.822657, 0.1962' +
                                                                   '73), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.462835, 0.336478), vec2(0.46499099999999993, 0.335' +
                                                                     '), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.645542, 0.322872), vec2(0.6444669999999999, 0.3243' +
                                                                   '76), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6441929999999999, 0.325326), vec2(0.64441299999999' +
                                                         '99, 0.324561), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7233499999999999, -0.397677), vec2(0.737945, -0.39' +
                                                                 '5348), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.85985, -0.385798), vec2(0.857667, -0.385639), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.529241, 0.38893), vec2(0.529655, 0.388902), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.8536029999999999, -0.045634), vec2(0.853594, -0.04' +
                                                                 '5597), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.51891, -0.393094), vec2(0.5188109999999999, -0.393' +
                                                                  '033), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.884199, -0.258722), vec2(0.8846369999999999, -0.25' +
                                                                 '7124), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.796209, 0.219375), vec2(0.7935939999999999, 0.2207' +
                                                                   '89), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.863652, -0.385433), vec2(0.864146, -0.385341), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.871372, -0.383782), vec2(0.8705639999999999, -0.38' +
                                                                 '4013), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5215209999999999, 0.336866), vec2(0.51921699999999' +
                                                         '99, 0.343472), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.515338, -0.354822), vec2(0.516874, -0.348056), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8280099999999999, -0.390472), vec2(0.825358, -0.39' +
                                                                 '0431), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4793879999999999, -0.20305), vec2(0.48003299999999' +
                                                       '993, -0.207315), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7509649999999999, 0.236703), vec2(0.754361, 0.2362' +
                                                                   '17), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5292009999999999, -0.393213), vec2(0.529218, -0.39' +
                                                                 '3213), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.57026, 0.176451), vec2(0.5751689999999999, 0.17519' +
                                                                    '6), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8748659999999999, 0.037238), vec2(0.87480099999999' +
                                                         '99, 0.037115), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.556279, 0.014435), vec2(0.55263, 0.0088), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.565152, 0.034239), vec2(0.5618489999999999, 0.0282' +
                                                                   '31), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.652509, -0.396502), vec2(0.654164, -0.396381), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.5140699999999999, -0.366529), vec2(0.5142399999999' +
                                                       '999, -0.365158), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6697329999999999, 0.278171), vec2(0.66691, 0.28470' +
                                                                    '5), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.382795, 0.351244), vec2(0.38386699999999996, 0.354' +
                                                                  '003), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8800509999999999, -0.37595), vec2(0.88089599999999' +
                                                        '99, -0.368784), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.47723799999999994, -0.188713), vec2(0.477371, -0.1' +
                                                                 '8933), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5220579999999999, 0.335274), vec2(0.524747, 0.3290' +
                                                                   '47), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.523057, 0.309058), vec2(0.5282429999999999, 0.3070' +
                                                                   '71), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.438446, 0.35271), vec2(0.433453, 0.356124), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.894261, -0.199976), vec2(0.892354, -0.204342), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.512918, -0.063317), vec2(0.511478, -0.064455), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.48219199999999995, -0.225074), vec2(0.481824999999' +
                                                     '99995, -0.222138), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4759319999999999, 0.328731), vec2(0.471055, 0.3316' +
                                                                   '82), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.865456, 0.131351), vec2(0.861807, 0.138495), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.7423219999999999, 0.237806), vec2(0.74187999999999' +
                                                         '99, 0.237799), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.624683, 0.352642), vec2(0.621188, 0.356454), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.779425, 0.227902), vec2(0.78204, 0.226489), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.611432, 0.150202), vec2(0.611432, 0.150411), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.611432, 0.150411), vec2(0.6104989999999999, 0.1557' +
                                                                   '27), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8399159999999999, 0.000272), vec2(0.839148, -0.000' +
                                                                   '28), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6727989999999999, 0.271822), vec2(0.672635, 0.2721' +
                                                                    '6), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6697329999999999, 0.278171), vec2(0.670744, 0.2755' +
                                                                   '04), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.549558, 0.002654), vec2(0.547792, -0.00213), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.9002539999999999, -0.17795), vec2(0.8996, -0.18518' +
                                                                    '2), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5292009999999999, -0.393213), vec2(0.5299659999999' +
                                                        '999, -0.39328), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.37995199999999996, 0.341198), vec2(0.382795, 0.351' +
                                                                  '244), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.534771, 0.392988), vec2(0.534003, 0.39245), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.5851609999999999, 0.393088), vec2(0.585982, 0.3918' +
                                                                   '56), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8748659999999999, -0.302374), vec2(0.870064, -0.30' +
                                                                 '6925), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8096509999999999, -0.390906), vec2(0.8030839999999' +
                                                       '999, -0.391357), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4839589999999999, -0.23245), vec2(0.48359599999999' +
                                                        '99, -0.230126), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.524011, -0.332309), vec2(0.524123, -0.33203), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.5023559999999999, -0.071696), vec2(0.505234, -0.06' +
                                                                 '9281), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.866073, -0.385117), vec2(0.8660509999999999, -0.38' +
                                                                  '512), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.388825, 0.362431), vec2(0.3847529999999999, 0.3584' +
                                                                   '48), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5596979999999999, 0.402323), vec2(0.552055, 0.4018' +
                                                                   '13), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.394624, 0.366104), vec2(0.391864, 0.363565), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.38317899999999994, 0.291926), vec2(0.3835179999999' +
                                                        '999, 0.291126), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6984239999999999, 0.23648), vec2(0.698298, 0.23646' +
                                                                    '6), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5215209999999999, 0.336866), vec2(0.52205799999999' +
                                                         '99, 0.335274), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4766229999999999, -0.167006), vec2(0.4765469999999' +
                                                      '9994, -0.159728), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4759319999999999, 0.328731), vec2(0.478166, 0.3273' +
                                                                   '06), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6452019999999999, -0.396472), vec2(0.6454529999999' +
                                                       '999, -0.396474), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8763259999999999, 0.0736), vec2(0.877477, 0.066319' +
                                                                     '), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.535885, -0.050058), vec2(0.534164, -0.050902), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.6452019999999999, -0.396472), vec2(0.6410779999999' +
                                                       '999, -0.396437), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.859043, 0.012928), vec2(0.85852, 0.012615), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.378339, 0.311454), vec2(0.37949199999999994, 0.306' +
                                                                  '564), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.38233399999999995, 0.294094), vec2(0.380721, 0.299' +
                                                                  '814), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.523057, 0.309058), vec2(0.5215209999999999, 0.3100' +
                                                                   '22), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8866189999999999, -0.078754), vec2(0.8842939999999' +
                                                       '999, -0.074425), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.720815, 0.237831), vec2(0.7178519999999999, 0.2376' +
                                                                   '84), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.572333, -0.393681), vec2(0.5686009999999999, -0.39' +
                                                                 '3697), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.585239, 0.060174), vec2(0.58527, 0.060211), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.8630909999999999, -0.317074), vec2(0.863065, -0.31' +
                                                                 '7053), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5941099999999999, 0.069458), vec2(0.598196, 0.0724' +
                                                                   '57), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.59242, 0.388496), vec2(0.593783, 0.385378), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.796132, -0.391346), vec2(0.7937449999999999, -0.39' +
                                                                 '1358), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6103179999999999, -0.395898), vec2(0.608277, -0.39' +
                                                                 '5494), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.774154, -0.39171), vec2(0.7734179999999999, -0.391' +
                                                                   '76), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5857899999999999, -0.393958), vec2(0.5826439999999' +
                                                       '999, -0.393763), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8630909999999999, -0.317074), vec2(0.863046, -0.31' +
                                                                 '7137), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8365469999999999, -0.01582), vec2(0.836452, -0.015' +
                                                                   '31), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8293539999999999, 0.189183), vec2(0.835166, 0.1818' +
                                                                   '88), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.568147, 0.177014), vec2(0.57026, 0.176451), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.879782, -0.350252), vec2(0.8798269999999999, -0.35' +
                                                                  '146), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.882778, -0.272562), vec2(0.882085, -0.268808), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.4810399999999999, -0.217885), vec2(0.4802339999999' +
                                                      '9994, -0.210422), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.486494, 0.198414), vec2(0.48759699999999995, 0.198' +
                                                                  '309), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.897988, -0.156566), vec2(0.898928, -0.162134), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8950689999999999, -0.128804), vec2(0.8945179999999' +
                                                       '999, -0.123488), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.523864, -0.332673), vec2(0.5232669999999999, -0.33' +
                                                                 '4586), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.477371, -0.18933), vec2(0.47738899999999995, -0.18' +
                                                                 '9409), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8492489999999999, -0.386014), vec2(0.845248, -0.38' +
                                                                 '5954), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.861769, -0.385616), vec2(0.86053, -0.385526), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.883277, -0.279706), vec2(0.882778, -0.272562), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8633299999999999, -0.385435), vec2(0.8633679999999' +
                                                       '999, -0.385431), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.534003, 0.39245), vec2(0.529655, 0.388902), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.853525, -0.045308), vec2(0.853594, -0.045597), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.6699259999999999, -0.395877), vec2(0.674291, -0.39' +
                                                                   '55), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.42634799999999995, 0.227391), vec2(0.429651, 0.224' +
                                                                  '844), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.861769, -0.385616), vec2(0.8633299999999999, -0.38' +
                                                                 '5435), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6699259999999999, -0.395877), vec2(0.668296, -0.39' +
                                                                 '5764), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.513725, -0.315154), vec2(0.514898, -0.318372), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.543029, -0.029514), vec2(0.544161, -0.026206), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.4067989999999999, 0.246722), vec2(0.40883099999999' +
                                                        '994, 0.245267), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.512918, -0.063317), vec2(0.513389, -0.063084), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.6625899999999999, 0.293646), vec2(0.661751, 0.2947' +
                                                                   '75), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6609689999999999, 0.296407), vec2(0.66027099999999' +
                                                          '99, 0.29734), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.498745, -0.277645), vec2(0.49544299999999997, -0.2' +
                                                                '69998), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6609689999999999, 0.296407), vec2(0.66148999999999' +
                                                         '99, 0.295127), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8730229999999999, -0.058498), vec2(0.8752199999999' +
                                                        '999, -0.06123), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.785531, -0.391653), vec2(0.784642, -0.391658), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.6625899999999999, 0.293646), vec2(0.664438, 0.2894' +
                                                                   '86), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.869758, -0.38429), vec2(0.868875, -0.38461), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.843488, -0.38605), vec2(0.843143, -0.386071), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.6633199999999999, -0.396058), vec2(0.660006, -0.39' +
                                                                 '6137), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.677723, -0.39543), vec2(0.676751, -0.395391), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.7225929999999999, 0.237833), vec2(0.722556, 0.2378' +
                                                                   '32), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8705639999999999, -0.384013), vec2(0.869758, -0.38' +
                                                                  '429), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.587313, -0.39413), vec2(0.5886899999999999, -0.394' +
                                                                  '124), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5282429999999999, 0.307071), vec2(0.529855, 0.3063' +
                                                                   '83), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.841452, -0.387261), vec2(0.842276, -0.386554), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.5749449999999999, 0.398154), vec2(0.57125799999999' +
                                                         '99, 0.399772), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.785531, -0.391653), vec2(0.786457, -0.391534), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.543029, -0.029514), vec2(0.5424859999999999, -0.03' +
                                                                  '175), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5348109999999999, 0.303759), vec2(0.539631, 0.3013' +
                                                                   '53), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.47573999999999994, -0.130106), vec2(0.476892, -0.1' +
                                                                '22962), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6518039999999999, 0.312662), vec2(0.652763, 0.3109' +
                                                                   '16), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.492294, -0.262305), vec2(0.49544299999999997, -0.2' +
                                                                '69998), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8909969999999999, -0.24271), vec2(0.89111499999999' +
                                                        '99, -0.239957), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.72961, 0.238074), vec2(0.727557, 0.237905), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.51311, -0.375948), vec2(0.512381, -0.379142), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.529855, 0.306383), vec2(0.5348109999999999, 0.3037' +
                                                                   '59), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.495788, 0.196363), vec2(0.4966339999999999, 0.1962' +
                                                                   '26), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.601101, 0.164876), vec2(0.594495, 0.16823), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.876595, 0.09513), vec2(0.8764029999999999, 0.08784' +
                                                                    '7), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.818827, -0.390556), vec2(0.8189009999999999, -0.39' +
                                                                 '0547), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.824437, 0.194606), vec2(0.8258589999999999, 0.1931' +
                                                                   '36), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6633199999999999, -0.396058), vec2(0.6649689999999' +
                                                       '999, -0.395925), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.47500999999999993, -0.137432), vec2(0.475155999999' +
                                                      '9999, -0.140198), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.861807, 0.138495), vec2(0.858044, 0.145683), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.47635399999999994, 0.201071), vec2(0.478313, 0.200' +
                                                                   '09), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6984239999999999, 0.23648), vec2(0.698511, 0.23648' +
                                                                    '8), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8540869999999999, -0.385834), vec2(0.857667, -0.38' +
                                                                 '5639), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.851131, -0.38583), vec2(0.8497619999999999, -0.385' +
                                                                   '81), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39166599999999996, 0.269434), vec2(0.3953179999999' +
                                                       '9995, 0.263292), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.518948, 0.372198), vec2(0.5215209999999999, 0.3787' +
                                                                   '16), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.489989, -0.087824), vec2(0.49021799999999993, -0.0' +
                                                                '87488), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.510575, -0.307913), vec2(0.513393, -0.313967), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.510652, -0.383754), vec2(0.5111399999999999, -0.38' +
                                                                 '4584), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.853934, 0.15301), vec2(0.8546, 0.151689), 1.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.60666, -0.395399), vec2(0.607116, -0.395373), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.6518039999999999, 0.312662), vec2(0.65240999999999' +
                                                         '99, 0.311372), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6360509999999999, -0.396694), vec2(0.6410779999999' +
                                                       '999, -0.396437), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.682561, 0.254822), vec2(0.685164, 0.249911), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.553245, 0.294674), vec2(0.5548829999999999, 0.2934' +
                                                                   '17), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5939949999999999, -0.394424), vec2(0.5886899999999' +
                                                       '999, -0.394124), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.44313199999999997, 0.34892), vec2(0.44481499999999' +
                                                        '996, 0.347601), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.547792, -0.00213), vec2(0.5471389999999999, -0.009' +
                                                                  '413), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6111249999999999, 0.368752), vec2(0.615695, 0.3646' +
                                                                    '5), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.615695, 0.36465), vec2(0.6184919999999999, 0.35968' +
                                                                    '3), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.871486, 0.116926), vec2(0.870678, 0.118987), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.5977969999999999, 0.382104), vec2(0.593783, 0.3853' +
                                                                   '78), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.559429, 0.179303), vec2(0.568147, 0.177014), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.740019, 0.237998), vec2(0.7414499999999999, 0.2377' +
                                                                   '91), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.524909, 0.190416), vec2(0.529454, 0.189276), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.608277, -0.395494), vec2(0.6075429999999999, -0.39' +
                                                                 '5349), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.523941, -0.056344), vec2(0.518678, -0.059487), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.753192, -0.39422), vec2(0.7540849999999999, -0.393' +
                                                                   '89), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.878015, 0.059175), vec2(0.8775059999999999, 0.0645' +
                                                                   '06), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7807689999999999, -0.391921), vec2(0.776839, -0.39' +
                                                                 '1713), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.510293, -0.307031), vec2(0.5096849999999999, -0.30' +
                                                                 '5385), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.824437, 0.194606), vec2(0.822657, 0.196273), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.8407229999999999, -0.02291), vec2(0.84375399999999' +
                                                        '99, -0.026527), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.704962, 0.237056), vec2(0.7048429999999999, 0.2370' +
                                                                   '48), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8668769999999999, -0.320158), vec2(0.871281, -0.32' +
                                                                  '564), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.3979269999999999, 0.365899), vec2(0.394624, 0.3661' +
                                                                   '04), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8820479999999999, -0.26533), vec2(0.882085, -0.268' +
                                                                  '808), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.775844, -0.391726), vec2(0.776566, -0.391698), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8644339999999999, -0.38531), vec2(0.86439199999999' +
                                                        '99, -0.385312), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.543412, 0.303896), vec2(0.5419649999999999, 0.3061' +
                                                                   '08), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.843488, -0.38605), vec2(0.845248, -0.385954), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.510652, -0.383754), vec2(0.512381, -0.379142), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.9002539999999999, -0.17076), vec2(0.89925499999999' +
                                                        '99, -0.163616), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.498745, -0.277645), vec2(0.49890999999999996, -0.2' +
                                                                '78088), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8536819999999999, -0.045637), vec2(0.8536029999999' +
                                                       '999, -0.045634), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4782369999999999, -0.195678), vec2(0.4793879999999' +
                                                        '999, -0.20305), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.598873, -0.395038), vec2(0.603587, -0.395019), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.6963509999999999, 0.236408), vec2(0.69562399999999' +
                                                          '99, 0.23681), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.531354, -0.393402), vec2(0.533103, -0.393406), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8499789999999999, 0.160154), vec2(0.853934, 0.1530' +
                                                                    '1), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.640967, 0.328918), vec2(0.6441929999999999, 0.3253' +
                                                                   '26), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.48021899999999995, -0.110733), vec2(0.480363, -0.1' +
                                                                '10288), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5068109999999999, -0.300088), vec2(0.5014719999999' +
                                                       '999, -0.291936), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5014719999999999, -0.291936), vec2(0.4998209999999' +
                                                      '9996, -0.284564), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.78699, 0.224366), vec2(0.792368, 0.221547), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.8352679999999999, 0.181767), vec2(0.835166, 0.1818' +
                                                                   '88), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395968, 0.261968), vec2(0.39984699999999995, 0.256' +
                                                                  '138), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.540686, -0.046184), vec2(0.5398879999999999, -0.04' +
                                                                 '7198), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.42707699999999993, 0.360134), vec2(0.4220469999999' +
                                                        '9995, 0.36249), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6602709999999999, 0.29734), vec2(0.659897, 0.29823' +
                                                                    '2), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8780919999999999, -0.064702), vec2(0.8752199999999' +
                                                        '999, -0.06123), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.855086, -0.046281), vec2(0.854584, -0.046098), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.6065929999999999, 0.10007), vec2(0.606055, 0.09260' +
                                                                    '6), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.531354, -0.393402), vec2(0.5297879999999999, -0.39' +
                                                                 '3263), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.855086, -0.046281), vec2(0.8553459999999999, -0.04' +
                                                                 '6413), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7700799999999999, -0.391986), vec2(0.7673989999999' +
                                                       '999, -0.392204), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.540686, -0.046184), vec2(0.540744, -0.045676), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8756729999999999, 0.102412), vec2(0.876595, 0.0951' +
                                                                    '3), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6214569999999999, -0.39657), vec2(0.617817, -0.395' +
                                                                  '962), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.842873, -0.386292), vec2(0.842276, -0.386554), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.47635399999999994, 0.201071), vec2(0.4682879999999' +
                                                        '999, 0.203108), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.83619, -0.009834), vec2(0.8364469999999999, -0.015' +
                                                                  '215), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8913039999999999, -0.20735), vec2(0.892354, -0.204' +
                                                                  '342), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6492239999999999, 0.317358), vec2(0.650134, 0.3152' +
                                                                   '27), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8805499999999999, -0.365192), vec2(0.88032, -0.357' +
                                                                  '958), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4777079999999999, -0.191595), vec2(0.4773969999999' +
                                                      '9996, -0.189448), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4777079999999999, -0.191595), vec2(0.4777929999999' +
                                                       '999, -0.192253), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.598873, -0.395038), vec2(0.5961449999999999, -0.39' +
                                                                 '4471), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4766229999999999, -0.167006), vec2(0.4764699999999' +
                                                      '9995, -0.174244), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7414499999999999, 0.237791), vec2(0.74187999999999' +
                                                         '99, 0.237799), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.553245, 0.294674), vec2(0.5495359999999999, 0.2980' +
                                                                   '01), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.541531, 0.300715), vec2(0.539631, 0.301353), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.513725, -0.315154), vec2(0.513393, -0.313967), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.587313, -0.39413), vec2(0.5857899999999999, -0.393' +
                                                                  '958), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.842873, -0.386292), vec2(0.8431249999999999, -0.38' +
                                                                 '6072), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.52918, -0.393211), vec2(0.526285, -0.393082), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.40145999999999993, 0.367227), vec2(0.4078739999999' +
                                                       '9996, 0.367014), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.83619, -0.009834), vec2(0.834382, -0.00301), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.7256549999999999, 0.237936), vec2(0.727557, 0.2379' +
                                                                   '05), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8116099999999999, -0.390816), vec2(0.8124939999999' +
                                                       '999, -0.390755), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.891458, -0.092906), vec2(0.891683, -0.094506), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.667045, -0.39583), vec2(0.667893, -0.395756), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.44340099999999993, 0.21627), vec2(0.437179, 0.2198' +
                                                                    '5), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.609719, 0.157639), vec2(0.6098889999999999, 0.1573' +
                                                                   '46), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.518948, 0.372198), vec2(0.517489, 0.365638), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.5064649999999999, 0.194358), vec2(0.49663399999999' +
                                                         '99, 0.196226), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8749039999999999, 0.03733), vec2(0.874981999999999' +
                                                          '9, 0.037636), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.492294, -0.262305), vec2(0.491012, -0.257722), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.670863, 0.27519), vec2(0.671315, 0.274363), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.67369, 0.270296), vec2(0.672635, 0.27216), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.670863, 0.27519), vec2(0.670744, 0.275504), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.609719, 0.157639), vec2(0.6091759999999999, 0.1585' +
                                                                   '81), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4168609999999999, 0.364802), vec2(0.415523, 0.3649' +
                                                                   '04), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.486571, -0.094016), vec2(0.48388299999999995, -0.1' +
                                                                '01082), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.667045, -0.39583), vec2(0.6659809999999999, -0.395' +
                                                                  '848), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.871294, 0.029819), vec2(0.8747879999999999, 0.0370' +
                                                                   '88), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7439359999999999, 0.237578), vec2(0.746035, 0.2373' +
                                                                   '09), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5427599999999999, -0.393757), vec2(0.53531, -0.393' +
                                                                  '786), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8691309999999999, -0.308435), vec2(0.870064, -0.30' +
                                                                 '6925), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5377289999999999, 0.31011), vec2(0.534810999999999' +
                                                          '9, 0.312646), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8913039999999999, -0.20735), vec2(0.891011, -0.211' +
                                                                  '954), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6492239999999999, 0.317358), vec2(0.647208, 0.3198' +
                                                                   '39), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8936089999999999, -0.114564), vec2(0.8933389999999' +
                                                       '999, -0.107421), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4682879999999999, 0.203108), vec2(0.46625299999999' +
                                                         '99, 0.203999), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.556817, -0.393974), vec2(0.5494049999999999, -0.39' +
                                                                 '4004), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.67369, 0.270296), vec2(0.6747479999999999, 0.26820' +
                                                                    '2), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6963509999999999, 0.236408), vec2(0.69651999999999' +
                                                         '99, 0.236371), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5068109999999999, -0.300088), vec2(0.509597, -0.30' +
                                                                 '5223), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.647129, -0.396584), vec2(0.6471619999999999, -0.39' +
                                                                 '6574), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.647129, -0.396584), vec2(0.6478809999999999, -0.39' +
                                                                 '6628), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6965199999999999, 0.236371), vec2(0.69652799999999' +
                                                         '99, 0.236371), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5295099999999999, -0.052594), vec2(0.534164, -0.05' +
                                                                 '0902), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6503089999999999, 0.314817), vec2(0.65240999999999' +
                                                         '99, 0.311372), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5749449999999999, 0.398154), vec2(0.58012999999999' +
                                                         '99, 0.395946), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.49890999999999996, -0.278088), vec2(0.498915, -0.2' +
                                                                '78101), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.686979, 0.247174), vec2(0.685164, 0.249911), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.857659, 0.011683), vec2(0.8528209999999999, 0.0077' +
                                                                   '71), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8780919999999999, -0.064702), vec2(0.879222, -0.06' +
                                                                 '6635), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7168209999999999, 0.23765), vec2(0.717851999999999' +
                                                          '9, 0.237684), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5773649999999999, 0.04963), vec2(0.577109, 0.04935' +
                                                                    '1), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5641919999999999, -0.393944), vec2(0.5686009999999' +
                                                       '999, -0.393697), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.41908899999999993, 0.234095), vec2(0.4140959999999' +
                                                         '999, 0.23931), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5618489999999999, 0.028231), vec2(0.559083, 0.0211' +
                                                                    '2), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.686979, 0.247174), vec2(0.68802, 0.245271), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.645542, 0.322872), vec2(0.6444129999999999, 0.3245' +
                                                                   '61), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.533735, 0.18709), vec2(0.529454, 0.189276), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.8641079999999999, -0.318029), vec2(0.863046, -0.31' +
                                                                 '7137), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7700799999999999, -0.391986), vec2(0.7734179999999' +
                                                        '999, -0.39176), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.78699, 0.224366), vec2(0.784411, 0.225384), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.4839589999999999, -0.23245), vec2(0.486178, -0.239' +
                                                                  '712), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.42707699999999993, 0.360134), vec2(0.431994, 0.357' +
                                                                  '087), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4825379999999999, 0.325822), vec2(0.487201, 0.3227' +
                                                                   '87), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5215209999999999, 0.310022), vec2(0.51633599999999' +
                                                         '99, 0.311775), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.49598, 0.319282), vec2(0.493054, 0.320154), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.516605, 0.192164), vec2(0.521598, 0.190994), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.8770169999999999, 0.04461), vec2(0.874981999999999' +
                                                          '9, 0.037636), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.88032, -0.357958), vec2(0.8798269999999999, -0.351' +
                                                                   '46), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.63801, 0.333522), vec2(0.6389309999999999, 0.33311' +
                                                                    '4), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.875251, 0.080882), vec2(0.875121, 0.081383), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.42634799999999995, 0.227391), vec2(0.4243899999999' +
                                                       '9993, 0.229104), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.611393, 0.145582), vec2(0.611432, 0.146381), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.884859, -0.256726), vec2(0.8846369999999999, -0.25' +
                                                                 '7124), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.678068, 0.262606), vec2(0.678703, 0.26131), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.576967, -0.393558), vec2(0.576287, -0.393524), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.693873, 0.237981), vec2(0.6939179999999999, 0.2379' +
                                                                   '29), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4810009999999999, -0.108138), vec2(0.480363, -0.11' +
                                                                 '0288), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6744199999999999, -0.39551), vec2(0.674291, -0.395' +
                                                                    '5), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5573549999999999, 0.179863), vec2(0.546524, 0.1827' +
                                                                   '14), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8969119999999999, -0.143), vec2(0.897181, -0.15014' +
                                                                    '4), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.580668, 0.173286), vec2(0.590312, 0.169894), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.412829, 0.366086), vec2(0.40787399999999996, 0.367' +
                                                                  '014), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8677219999999999, 0.022275), vec2(0.86838399999999' +
                                                         '99, 0.023844), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.476278, -0.151813), vec2(0.47646999999999995, -0.1' +
                                                                '52442), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5192169999999999, 0.343472), vec2(0.51801999999999' +
                                                         '99, 0.350195), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39984699999999995, 0.256138), vec2(0.4009999999999' +
                                                        '999, 0.254406), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.607629, 0.10785), vec2(0.6088199999999999, 0.11531' +
                                                                    '4), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.611432, 0.146381), vec2(0.611432, 0.150202), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.627563, 0.349095), vec2(0.6300009999999999, 0.3434' +
                                                                    '8), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7740859999999999, 0.23021), vec2(0.77255, 0.230944' +
                                                                     '), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.48023399999999994, -0.210422), vec2(0.480032999999' +
                                                     '99993, -0.207315), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7548819999999999, 0.236148), vec2(0.754361, 0.2362' +
                                                                   '17), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.39166599999999996, 0.269434), vec2(0.3890549999999' +
                                                       '9993, 0.274728), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7168209999999999, 0.23765), vec2(0.71517, 0.237551' +
                                                                     '), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.395968, 0.261968), vec2(0.39531799999999995, 0.263' +
                                                                  '292), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7740859999999999, 0.23021), vec2(0.779425, 0.22790' +
                                                                    '2), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.546524, 0.182714), vec2(0.543951, 0.183146), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.8066929999999999, 0.211523), vec2(0.805234, 0.2128' +
                                                                   '11), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8374189999999999, -0.019195), vec2(0.8367829999999' +
                                                       '999, -0.018415), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.819253, -0.39055), vec2(0.821863, -0.390445), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.617749, -0.395958), vec2(0.6177809999999999, -0.39' +
                                                                 '5956), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8912659999999999, -0.221548), vec2(0.8913039999999' +
                                                       '999, -0.228737), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.568031, 0.399999), vec2(0.5712579999999999, 0.3997' +
                                                                   '72), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7874129999999999, -0.391469), vec2(0.786457, -0.39' +
                                                                 '1534), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.600563, 0.380166), vec2(0.5977969999999999, 0.3821' +
                                                                   '04), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4009999999999999, 0.254406), vec2(0.40357299999999' +
                                                        '996, 0.250807), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4782369999999999, -0.195678), vec2(0.4777929999999' +
                                                       '999, -0.192253), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.689967, 0.242455), vec2(0.693873, 0.237981), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.882795, -0.262113), vec2(0.8830039999999999, -0.26' +
                                                                 '1212), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.600563, 0.380166), vec2(0.602499, 0.376443), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.47500999999999993, -0.137432), vec2(0.475739999999' +
                                                     '99994, -0.130106), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.863575, 0.017395), vec2(0.8677219999999999, 0.0222' +
                                                                   '75), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.688746, -0.395446), vec2(0.684314, -0.39527), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.868875, -0.38461), vec2(0.868068, -0.384886), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.607015, 0.161071), vec2(0.601101, 0.164876), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.853691, -0.045676), vec2(0.8536819999999999, -0.04' +
                                                                 '5637), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.839148, -0.00028), vec2(0.834382, -0.00301), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.819253, -0.39055), vec2(0.8189009999999999, -0.390' +
                                                                  '547), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8912659999999999, -0.221548), vec2(0.8909969999999' +
                                                       '999, -0.214494), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.801509, 0.215542), vec2(0.796209, 0.219375), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.5773649999999999, 0.04963), vec2(0.581024, 0.05335' +
                                                                    '4), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5162209999999999, -0.39323), vec2(0.51881099999999' +
                                                        '99, -0.393033), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.607015, 0.161071), vec2(0.6072059999999999, 0.1609' +
                                                                   '43), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.897565, -0.192602), vec2(0.8996, -0.185182), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.665164, -0.395919), vec2(0.6649689999999999, -0.39' +
                                                                 '5925), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7874129999999999, -0.391469), vec2(0.788351, -0.39' +
                                                                 '1412), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.665164, -0.395919), vec2(0.6659809999999999, -0.39' +
                                                                 '5848), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8933389999999999, -0.107421), vec2(0.892873, -0.10' +
                                                                    '2), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7007789999999999, 0.236697), vec2(0.698511, 0.2364' +
                                                                   '88), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.48561, 0.198514), vec2(0.486494, 0.198414), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.533735, 0.18709), vec2(0.536922, 0.186462), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.556817, -0.393974), vec2(0.5641919999999999, -0.39' +
                                                                 '3944), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.524262, -0.331608), vec2(0.524123, -0.33203), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.875404, -0.333393), vec2(0.872314, -0.327094), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8928019999999999, -0.100094), vec2(0.891683, -0.09' +
                                                                 '4506), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8909969999999999, -0.214494), vec2(0.891011, -0.21' +
                                                                 '1954), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8913039999999999, -0.228737), vec2(0.8912329999999' +
                                                       '999, -0.231378), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.516874, -0.348056), vec2(0.519219, -0.342525), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8496859999999999, -0.38584), vec2(0.84976199999999' +
                                                         '99, -0.38581), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.486571, -0.094016), vec2(0.489321, -0.089327), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.737945, -0.395348), vec2(0.7475559999999999, -0.39' +
                                                                  '448), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.521636, -0.33063), vec2(0.523134, -0.331086), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.678068, 0.262606), vec2(0.6747479999999999, 0.2682' +
                                                                   '02), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.47646999999999995, -0.174244), vec2(0.476622999999' +
                                                      '9999, -0.179087), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4825379999999999, 0.325822), vec2(0.478166, 0.3273' +
                                                                   '06), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.884199, -0.258722), vec2(0.8830039999999999, -0.26' +
                                                                 '1212), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7839179999999999, 0.225604), vec2(0.78238199999999' +
                                                         '99, 0.226339), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.873453, -0.382612), vec2(0.8727719999999999, -0.38' +
                                                                 '2995), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5178339999999999, 0.350846), vec2(0.51801999999999' +
                                                         '99, 0.350195), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5094989999999999, 0.314078), vec2(0.50598599999999' +
                                                         '99, 0.315296), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.72961, 0.238074), vec2(0.7352559999999999, 0.23826' +
                                                                    '4), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8258589999999999, 0.193136), vec2(0.82935399999999' +
                                                         '99, 0.189183), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.607629, 0.10785), vec2(0.606791, 0.101293), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.683631, -0.395286), vec2(0.684314, -0.39527), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.689967, 0.242455), vec2(0.68802, 0.245271), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.5199079999999999, -0.393186), vec2(0.5191079999999' +
                                                       '999, -0.393112), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.605248, -0.39548), vec2(0.6052179999999999, -0.395' +
                                                                  '319), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7256549999999999, 0.237936), vec2(0.72259299999999' +
                                                         '99, 0.237833), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.42204699999999995, 0.36249), vec2(0.41686099999999' +
                                                         '99, 0.364802), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7652909999999999, -0.392853), vec2(0.7642929999999' +
                                                       '999, -0.392773), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7823819999999999, 0.226339), vec2(0.78204, 0.22648' +
                                                                    '9), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.801509, 0.215542), vec2(0.8027449999999999, 0.2145' +
                                                                   '84), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8116099999999999, -0.390816), vec2(0.811364, -0.39' +
                                                                 '0814), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8066929999999999, 0.211523), vec2(0.808138, 0.2101' +
                                                                   '78), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.513413, -0.063073), vec2(0.5178619999999999, -0.06' +
                                                                 '0014), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.476278, -0.151813), vec2(0.4755959999999999, -0.14' +
                                                                 '6364), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6065929999999999, 0.10007), vec2(0.606688, 0.10048' +
                                                                    '5), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8730229999999999, -0.058498), vec2(0.870142, -0.05' +
                                                                 '5548), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6068939999999999, 0.082714), vec2(0.606885, 0.0827' +
                                                                   '05), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.871294, 0.029819), vec2(0.8683839999999999, 0.0238' +
                                                                   '44), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.875404, -0.333393), vec2(0.877113, -0.338757), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.5064649999999999, 0.194358), vec2(0.514359, 0.1927' +
                                                                   '21), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.47654699999999994, -0.159728), vec2(0.476469999999' +
                                                     '99995, -0.152537), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.891573, -0.23561), vec2(0.8911149999999999, -0.239' +
                                                                  '957), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5163359999999999, 0.311775), vec2(0.51472199999999' +
                                                         '99, 0.312555), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.37949199999999994, 0.306564), vec2(0.380721, 0.299' +
                                                                  '814), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4810009999999999, -0.108138), vec2(0.4838829999999' +
                                                      '9995, -0.101082), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.572333, -0.393681), vec2(0.574719, -0.39353), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.8499789999999999, 0.160154), vec2(0.84764, 0.16372' +
                                                                    '9), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.746202, 0.237296), vec2(0.7463549999999999, 0.2372' +
                                                                   '67), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.740019, 0.237998), vec2(0.738594, 0.237926), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.7652909999999999, -0.392853), vec2(0.766097, -0.39' +
                                                                 '2574), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6956239999999999, 0.23681), vec2(0.693917999999999' +
                                                          '9, 0.237929), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.533404, -0.393421), vec2(0.533103, -0.393406), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.8655329999999999, -0.38525), vec2(0.86443399999999' +
                                                         '99, -0.38531), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.877477, 0.066319), vec2(0.8775059999999999, 0.0645' +
                                                                   '06), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.841452, -0.387261), vec2(0.8361909999999999, -0.38' +
                                                                  '965), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.49982099999999996, -0.284564), vec2(0.499706, -0.2' +
                                                                '83591), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.871486, 0.116926), vec2(0.873983, 0.109646), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.539767, -0.047351), vec2(0.5398879999999999, -0.04' +
                                                                 '7198), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6484949999999999, -0.396674), vec2(0.6478809999999' +
                                                       '999, -0.396628), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.897181, -0.150144), vec2(0.897009, -0.153703), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.658519, 0.301519), vec2(0.659897, 0.298232), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.661751, 0.294775), vec2(0.6614899999999999, 0.2951' +
                                                                   '27), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.7807689999999999, -0.391921), vec2(0.784642, -0.39' +
                                                                 '1658), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5801299999999999, 0.395946), vec2(0.58516099999999' +
                                                         '99, 0.393088), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.510575, -0.307913), vec2(0.510293, -0.307031), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.5939949999999999, -0.394424), vec2(0.59539, -0.394' +
                                                                  '427), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6573669999999999, -0.396366), vec2(0.654164, -0.39' +
                                                                 '6381), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8668769999999999, -0.320158), vec2(0.8641079999999' +
                                                       '999, -0.318029), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6573669999999999, -0.396366), vec2(0.660006, -0.39' +
                                                                 '6137), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.37787799999999994, 0.329434), vec2(0.379108, 0.334' +
                                                                  '794), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.4067989999999999, 0.246722), vec2(0.40357299999999' +
                                                        '996, 0.250807), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8361909999999999, -0.38965), vec2(0.83534599999999' +
                                                        '99, -0.389882), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.45645899999999995, 0.340763), vec2(0.4612219999999' +
                                                        '999, 0.337214), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.650134, 0.315227), vec2(0.6503089999999999, 0.3148' +
                                                                   '17), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6360509999999999, -0.396694), vec2(0.6287919999999' +
                                                       '999, -0.396634), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.756418, 0.235923), vec2(0.7548819999999999, 0.2361' +
                                                                   '48), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.667893, -0.395756), vec2(0.6680189999999999, -0.39' +
                                                                 '5745), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8407229999999999, -0.02291), vec2(0.83741899999999' +
                                                        '99, -0.019195), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.840568, 0.174486), vec2(0.845561, 0.167388), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.863575, 0.017395), vec2(0.859043, 0.012928), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.6091759999999999, 0.158581), vec2(0.60720599999999' +
                                                         '99, 0.160943), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.412829, 0.366086), vec2(0.415523, 0.364904), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.4878389999999999, -0.247241), vec2(0.48995, -0.254' +
                                                                  '797), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.47646999999999995, -0.152537), vec2(0.476469999999' +
                                                     '99995, -0.152443), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.746202, 0.237296), vec2(0.746035, 0.237309), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.8928019999999999, -0.100094), vec2(0.892873, -0.10' +
                                                                    '2), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.48561, 0.198514), vec2(0.478313, 0.20009), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.5178339999999999, 0.350846), vec2(0.516681, 0.3575' +
                                                                   '86), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.864146, -0.385341), vec2(0.8643919999999999, -0.38' +
                                                                 '5312), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.658519, 0.301519), vec2(0.6555639999999999, 0.3061' +
                                                                   '37), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.8655329999999999, -0.38525), vec2(0.86605099999999' +
                                                         '99, -0.38512), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5199079999999999, -0.34071), vec2(0.519219, -0.342' +
                                                                  '525), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.756418, 0.235923), vec2(0.761873, 0.234314), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.489989, -0.087824), vec2(0.489321, -0.089327), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.753192, -0.39422), vec2(0.7475559999999999, -0.394' +
                                                                   '48), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.845561, 0.167388), vec2(0.84764, 0.163729), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.45645899999999995, 0.340763), vec2(0.4523669999999' +
                                                       '9996, 0.342801), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.698298, 0.236466), vec2(0.696658, 0.236345), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.883277, -0.279706), vec2(0.882922, -0.283863), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.5348109999999999, 0.312646), vec2(0.53413499999999' +
                                                         '99, 0.314302), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.53531, -0.393786), vec2(0.533404, -0.393421), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.499706, -0.283591), vec2(0.498915, -0.278101), 1.0' +
                                                                           ', isect);\n'   +
        '    lineIntersect(ray, vec2(0.857659, 0.011683), vec2(0.85852, 0.012615), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.502701, 0.316614), vec2(0.5059859999999999, 0.3152' +
                                                                   '96), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.502701, 0.316614), vec2(0.49971999999999994, 0.317' +
                                                                  '594), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.544488, 0.399698), vec2(0.5494249999999999, 0.4004' +
                                                                   '45), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.554781, 0.293478), vec2(0.5548829999999999, 0.2934' +
                                                                   '17), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.63801, 0.333522), vec2(0.63374, 0.338707), 1.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.868721, 0.124254), vec2(0.870678, 0.118987), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.682561, 0.254822), vec2(0.6817249999999999, 0.2560' +
                                                                   '26), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.677723, -0.39543), vec2(0.683631, -0.395286), 1.0,' +
                                                                            ' isect);\n'   +
        '    lineIntersect(ray, vec2(0.763408, -0.393034), vec2(0.7642929999999999, -0.39' +
                                                                 '2773), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.763408, -0.393034), vec2(0.7540849999999999, -0.39' +
                                                                  '389), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.805234, 0.212811), vec2(0.8027449999999999, 0.2145' +
                                                                   '84), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.810534, 0.208006), vec2(0.808138, 0.210178), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.8969119999999999, -0.143), vec2(0.896106, -0.13585' +
                                                                    '6), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.606791, 0.101293), vec2(0.606688, 0.100485), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.846675, -0.029732), vec2(0.8437539999999999, -0.02' +
                                                                 '6527), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.850938, -0.036514), vec2(0.8506589999999999, -0.03' +
                                                                 '6096), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.6930609999999999, -0.395131), vec2(0.694781, -0.39' +
                                                                 '5089), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.516605, 0.192164), vec2(0.514359, 0.192721), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.495788, 0.196363), vec2(0.48759699999999995, 0.198' +
                                                                  '309), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5377289999999999, 0.31011), vec2(0.541964999999999' +
                                                          '9, 0.306108), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5427599999999999, -0.393757), vec2(0.5437639999999' +
                                                       '999, -0.393753), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.5199079999999999, -0.34071), vec2(0.52326699999999' +
                                                        '99, -0.334586), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.678703, 0.26131), vec2(0.681657, 0.256124), 1.0, i' +
                                                                              'sect);\n'   +
        '    lineIntersect(ray, vec2(0.851131, -0.38583), vec2(0.851569, -0.38578), 1.0, ' +
                                                                             'isect);\n'   +
        '    lineIntersect(ray, vec2(0.41908899999999993, 0.234095), vec2(0.4243899999999' +
                                                       '9993, 0.229104), 1.0, isect);\n'   +
        '    lineIntersect(ray, vec2(0.646917, 0.320197), vec2(0.6444669999999999, 0.3243' +
                                                                   '76), 1.0, isect);\n'   +
        '}\n\n'                                                                            +

        'vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, in' +
                                             'out vec3 throughput, out float tMult) {\n'   +
        '    tMult = 1.0;\n'                                                               +
        '    if (isect.mat == 0.0) {\n'                                                    +
        '        throughput *= vec3(0.0);\n'                                               +
        '        return sampleDiffuse(state, wiLocal);\n'                                  +
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
        '    sphereIntersect(ray, vec2(-0.95, 0.25), 0.4, 0.0, isect); // top left -1.35,' +
                                                                     '-0.15 0.15,0.65\n'   +
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

    'sensor-vert':
        '#include "preamble"\n\n'                                                   +

        'attribute vec3 Position;\n\n'                                              +

        'uniform vec2 spadPos;\n'                                                   +
        'uniform float angle;\n'                                                    +
        'uniform float aspect;\n\n'                                                 +

        'void main() {\n'                                                           +
        '    float rotatedX = Position.x * cos(angle) - Position.y * sin(angle);\n' +
        '    float rotatedY = Position.x * sin(angle) + Position.y * cos(angle);\n' +
        '    vec2 pos = vec2(rotatedX, rotatedY) + spadPos;\n'                      +
        '    gl_Position = vec4(pos.x / aspect, pos.y, Position.z, 1.0);\n'         +
        '}\n',

    'show-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D radiance;\n'                                                    +
        'uniform sampler2D colormap;\n\n'                                                  +

        'uniform sampler2D maxValue; // it would be nice to check what is faster\n'        +
        'uniform int isComplex;\n'                                                         +
        'uniform int usePhase;\n\n'                                                        +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '    vec2 radianceVec = texture2D(radiance, mPos).xy;\n'                           +
        '    // If complex number, compute module (length), otherwise, use only the first' +
                                                                          ' component\n'   +
        '    float radianceTex = abs(radianceVec.x) * float(1 - isComplex) + length(radia' +
                                                         'nceVec) * float(isComplex);\n'   +
        '    radianceTex *= float(1 - usePhase);\n'                                        +
        '    radianceTex += float(usePhase) * atan(radianceVec.y, radianceVec.x);\n'       +
        '    float xCoord = radianceTex / texture2D(maxValue, vec2(0.5)).x * float(1 - us' +
                                                                            'ePhase);\n'   +
        '    xCoord += float(usePhase == 1 && radianceVec.x != 0.0) * (radianceTex + PI) ' +
                                                                       '/ (2.0 * PI);\n'   +
        '    xCoord += float(usePhase == 1 && radianceVec.x == 0.0) * (PI / 2.0 * sign(ra' +
                                                    'dianceVec.y) + PI) / (2.0 * PI);\n'   +
        '    gl_FragColor = texture2D(colormap, vec2(xCoord, 0.5));\n'                     +
        '}\n',

    'show-func-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D radiance;\n'                                                    +
        'uniform sampler2D colormap;\n\n'                                                  +

        'uniform sampler2D maxValue; // it would be nice to check what is faster\n'        +
        'uniform int isComplex;\n'                                                         +
        'uniform int usePhase;\n\n'                                                        +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'void main() {\n'                                                                  +
        '    vec2 radianceVec = texture2D(radiance, mPos).xy;\n'                           +
        '    // If complex number, compute module (length), otherwise, use only the first' +
                                                                          ' component\n'   +
        '    float radianceTex = abs(radianceVec.x) * float(1 - isComplex) + length(radia' +
                                                         'nceVec) * float(isComplex);\n'   +
        '    radianceTex *= float(1 - usePhase);\n'                                        +
        '    radianceTex += float(usePhase) * atan(radianceVec.y, radianceVec.x);\n'       +
        '    float xCoord = float(1 - usePhase) * {func}radianceTex) / {func}texture2D(ma' +
                                                              'xValue, vec2(0.5)).x);\n'   +
        '    xCoord += {func}radianceTex + PI) / {func}2.0 * PI) * float(usePhase == 1 &&' +
                                                             ' radianceVec.x != 0.0);\n'   +
        '    xCoord += {func}PI / 2.0 * sign(radianceVec.y) + PI) / {func}2.0 * PI) * flo' +
                                          'at(usePhase == 1 && radianceVec.x == 0.0);\n\n' +

        '    gl_FragColor = texture2D(colormap, vec2(xCoord, 0.5));\n'                     +
        '}\n',

    'show-vert':
        '#include "preamble"\n\n'                       +

        'attribute vec2 Position;\n\n'                  +

        'varying vec2 mPos;\n\n'                        +

        'void main() {\n'                               +
        '    gl_Position = vec4(Position, 1.0, 1.0);\n' +
        '    mPos = Position/2.0+vec2(0.5);\n'          +
        '}\n',

    'sum-frag':
        '#include "preamble"\n\n'                                                          +

        '// Inspired from https://github.com/regl-project/regl/blob/gh-pages/example/redu' +
                                                                            'ction.js\n\n' +

        'uniform sampler2D tex;\n'                                                         +
        'uniform vec2 numPixels;\n'                                                        +
        'uniform int oneRow;\n\n'                                                          +

        'varying vec2 mPos;\n\n'                                                           +

        'void main () {\n'                                                                 +
        '	vec2 intervalSize = 1.0 / numPixels;\n\n'                                        +

        '	// mPos are the coordinates of the center of the new pixel\n'                    +
        '	// this is also the shared vertex of the old pixels we want to compare\n'        +
        '	// => access the center of those pixels\n'                                       +
        '	float a = texture2D(tex, mPos + intervalSize * vec2(-0.25)).x;\n'                +
        '	float b = texture2D(tex, mPos + intervalSize * vec2(0.25)).x;\n'                 +
        '	float c = texture2D(tex, mPos + intervalSize * vec2(-0.25, 0.25)).x;\n'          +
        '	float d = texture2D(tex, mPos + intervalSize * vec2(0.25, -0.25)).x;\n'          +
        '	// If tex.height == 1, we have already added all rows, so reduce only in dimens' +
                                             'ion X (assuming width >= height always)\n'   +
        '	float result = (a + d) * float(1 - oneRow) + (b + c);\n\n'                       +

        '	gl_FragColor = vec4(result, 0.0, 0.0, 1.0);\n'                                   +
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