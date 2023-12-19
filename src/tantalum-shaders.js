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

    'bp-sum-frag':
        '#include "preamble"\n\n'                                                          +

        'uniform sampler2D radiance; // x time, y spad\n\n'                                +

        'uniform int numRows;\n'                                                           +
        'uniform int useAbsolute;\n'                                                       +
        'uniform vec2 numPixels;\n\n'                                                      +

        'varying vec2 mPos; // Pixel coordinates [0,1]\n\n'                                +

        'const int numSpads = {numSpads};\n\n'                                             +

        'void main() {\n'                                                                  +
        '    float x = floor(mPos.x * numPixels.x);\n'                                     +
        '    float y = floor(mPos.y * numPixels.y);\n'                                     +
        '    float npy = numPixels.y / float(numRows);\n'                                  +
        '    float yStart = (floor(y / npy) * 2.0 + 1.0) / float(numRows * 2); // 0.5 for' +
                          ' single row, for two rows: 0.25 for first, 0.75 for second\n'   +
        '    bool isSecond = (y >= npy) && (numRows == 2);\n'                              +
        '    y = mod(y, npy);\n'                                                           +
        '    float pos = x + numPixels.x * (npy - 1.0 - y);\n'                             +
        '    pos = (pos + 0.5) / (numPixels.x * npy);\n\n'                                 +

        '    float spadDist = 1.0 / float(numSpads);\n\n'                                  +

        '    vec2 radianceAccum = vec2(0.0);\n'                                            +
        '    for (int i = 0; i < 1; i++) {\n'                                              +
        '        radianceAccum += texture2D(radiance, vec2(pos, spadDist * (float(i) + yS' +
                                                                         'tart))).xy;\n'   +
        '    }\n\n'                                                                        +

        '    //radianceAccum.x = radianceAccum.x * float(1 - useAbsolute) + length(radian' +
                                                      'ceAccum) * float(useAbsolute);\n'   +
        '    //radianceAccum.y = radianceAccum.y * float(1 - useAbsolute);\n'              +
        '    float result = length(radianceAccum);\n\n'                                    +

        '    if (useAbsolute > 0) {\n'                                                     +
        '        gl_FragColor = vec4(result, 0.0, 0.0, 1.0);\n'                            +
        '    } else {\n'                                                                   +
        '        gl_FragColor = vec4(radianceAccum, 0.0, 1.0);\n'                          +
        '    }\n'                                                                          +
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
        '	// gl_FragColor = vec4(mPos, oddX && (x == np.x - 1.0), 1.0);\n'                 +
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
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2( 1.2, -1.0), vec2( 1.2,   1.0), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.6, 0.3), vec2(0.45, -0.3), 0.0, isect);\n'          +
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

    'scene23-cascaded-v1':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.41, -0.4), vec2(0.39, -0.38), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.39, -0.38), vec2(0.41, -0.36), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.36), vec2(0.39, -0.34), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.34), vec2(0.41, -0.32), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.32), vec2(0.39, -0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.30), vec2(0.41, -0.28), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.28), vec2(0.39, -0.26), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.26), vec2(0.41, -0.24), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.24), vec2(0.39, -0.22), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.22), vec2(0.41, -0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.20), vec2(0.39, -0.18), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.18), vec2(0.41, -0.16), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.16), vec2(0.39, -0.14), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.14), vec2(0.41, -0.12), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.12), vec2(0.39, -0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.10), vec2(0.41, -0.08), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.08), vec2(0.39, -0.06), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.06), vec2(0.41, -0.04), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.04), vec2(0.39, -0.02), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.02), vec2(0.41, 0.0), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.0), vec2(0.39, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.39, 0.02), vec2(0.41, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.04), vec2(0.39, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.06), vec2(0.41, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.08), vec2(0.39, 0.10), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.10), vec2(0.41, 0.12), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.12), vec2(0.39, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.14), vec2(0.41, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.16), vec2(0.39, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.18), vec2(0.41, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.20), vec2(0.39, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.22), vec2(0.41, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.24), vec2(0.39, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.26), vec2(0.41, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.28), vec2(0.39, 0.30), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.30), vec2(0.41, 0.32), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.32), vec2(0.39, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.34), vec2(0.41, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.36), vec2(0.39, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.38), vec2(0.41, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.21, 0.0), vec2(1.19, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.02), vec2(1.21, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.04), vec2(1.19, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.06), vec2(1.21, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.08), vec2(1.19, 0.1), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.1), vec2(1.21, 0.12), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.12), vec2(1.19, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.14), vec2(1.21, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.16), vec2(1.19, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.18), vec2(1.21, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.20), vec2(1.19, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.22), vec2(1.21, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.24), vec2(1.19, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.26), vec2(1.21, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.28), vec2(1.19, 0.3), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.3), vec2(1.21, 0.32), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.32), vec2(1.19, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.34), vec2(1.21, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.36), vec2(1.19, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.38), vec2(1.21, 0.40), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.40), vec2(1.19, 0.42), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.42), vec2(1.21, 0.44), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.44), vec2(1.19, 0.463), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.463), vec2(1.21, 0.485), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.21, 0.485), vec2(1.19, 0.50), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.50), vec2(1.21, 0.52), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.52), vec2(1.19, 0.54), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.54), vec2(1.21, 0.56), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.56), vec2(1.19, 0.58), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.58), vec2(1.21, 0.60), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.60), vec2(1.19, 0.62), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.62), vec2(1.21, 0.64), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.64), vec2(1.19, 0.66), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.66), vec2(1.21, 0.68), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.68), vec2(1.19, 0.70), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.70), vec2(1.21, 0.72), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.72), vec2(1.19, 0.74), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.74), vec2(1.21, 0.76), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.76), vec2(1.19, 0.78), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.78), vec2(1.21, 0.80), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.80), vec2(1.19, 0.82), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.82), vec2(1.21, 0.84), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.84), vec2(1.19, 0.86), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.86), vec2(1.21, 0.88), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.88), vec2(1.19, 0.90), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.90), vec2(1.21, 0.92), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.92), vec2(1.19, 0.94), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.94), vec2(1.21, 0.96), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.96), vec2(1.19, 0.98), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.98), vec2(1.21, 1.00), 0.0, isect);\n'        +
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

    'scene24-cascaded-v2':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40, -0.4), vec2(0.40, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.21, 0.0), vec2(1.19, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.02), vec2(1.21, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.04), vec2(1.19, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.06), vec2(1.21, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.08), vec2(1.19, 0.1), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.1), vec2(1.21, 0.12), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.12), vec2(1.19, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.14), vec2(1.21, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.16), vec2(1.19, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.18), vec2(1.21, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.20), vec2(1.19, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.22), vec2(1.21, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.24), vec2(1.19, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.26), vec2(1.21, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.28), vec2(1.19, 0.3), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.3), vec2(1.21, 0.32), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.32), vec2(1.19, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.34), vec2(1.21, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.36), vec2(1.19, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.38), vec2(1.21, 0.40), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.40), vec2(1.19, 0.42), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.42), vec2(1.21, 0.44), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.44), vec2(1.19, 0.463), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.463), vec2(1.21, 0.485), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.21, 0.485), vec2(1.19, 0.50), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.50), vec2(1.21, 0.52), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.52), vec2(1.19, 0.54), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.54), vec2(1.21, 0.56), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.56), vec2(1.19, 0.58), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.58), vec2(1.21, 0.60), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.60), vec2(1.19, 0.62), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.62), vec2(1.21, 0.64), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.64), vec2(1.19, 0.66), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.66), vec2(1.21, 0.68), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.68), vec2(1.19, 0.70), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.70), vec2(1.21, 0.72), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.72), vec2(1.19, 0.74), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.74), vec2(1.21, 0.76), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.76), vec2(1.19, 0.78), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.78), vec2(1.21, 0.80), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.80), vec2(1.19, 0.82), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.82), vec2(1.21, 0.84), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.84), vec2(1.19, 0.86), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.86), vec2(1.21, 0.88), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.88), vec2(1.19, 0.90), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.90), vec2(1.21, 0.92), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.92), vec2(1.19, 0.94), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.94), vec2(1.21, 0.96), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.96), vec2(1.19, 0.98), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.98), vec2(1.21, 1.00), 0.0, isect);\n'        +
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

    'scene25-line-largewall':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n'                +
        '    lineIntersect(ray, vec2( 1.2, -1.0), vec2( 1.2,   1.0), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.0, 0.5), vec2(0.0, -0.5), 0.0, isect);\n'           +
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

    'scene26-ku-planar-planar':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40, -0.4), vec2(0.40, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20, 0.0), vec2(1.20, 1.00), 0.0, isect);\n'         +
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

    'scene27-ku-planar-semi':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40, -0.4), vec2(0.40, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.21, 0.0), vec2(1.19, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.02), vec2(1.21, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.04), vec2(1.19, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.06), vec2(1.21, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.08), vec2(1.19, 0.1), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.1), vec2(1.21, 0.12), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.12), vec2(1.19, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.14), vec2(1.21, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.16), vec2(1.19, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.18), vec2(1.21, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.20), vec2(1.19, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.22), vec2(1.21, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.24), vec2(1.19, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.26), vec2(1.21, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.28), vec2(1.19, 0.3), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.3), vec2(1.21, 0.32), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.32), vec2(1.19, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.34), vec2(1.21, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.36), vec2(1.19, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.38), vec2(1.21, 0.40), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.40), vec2(1.19, 0.42), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.42), vec2(1.21, 0.44), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.44), vec2(1.19, 0.463), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.463), vec2(1.21, 0.485), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.21, 0.485), vec2(1.19, 0.50), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.50), vec2(1.21, 0.52), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.52), vec2(1.19, 0.54), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.54), vec2(1.21, 0.56), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.56), vec2(1.19, 0.58), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.58), vec2(1.21, 0.60), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.60), vec2(1.19, 0.62), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.62), vec2(1.21, 0.64), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.64), vec2(1.19, 0.66), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.66), vec2(1.21, 0.68), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.68), vec2(1.19, 0.70), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.70), vec2(1.21, 0.72), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.72), vec2(1.19, 0.74), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.74), vec2(1.21, 0.76), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.76), vec2(1.19, 0.78), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.78), vec2(1.21, 0.80), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.80), vec2(1.19, 0.82), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.82), vec2(1.21, 0.84), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.84), vec2(1.19, 0.86), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.86), vec2(1.21, 0.88), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.88), vec2(1.19, 0.90), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.90), vec2(1.21, 0.92), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.92), vec2(1.19, 0.94), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.94), vec2(1.21, 0.96), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.96), vec2(1.19, 0.98), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.98), vec2(1.21, 1.00), 0.0, isect);\n'        +
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

    'scene28-ku-planar-rough':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40, -0.4), vec2(0.40, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.225, 0.00), vec2(1.175, 0.05), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.05), vec2(1.225, 0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.10), vec2(1.175, 0.15), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.15), vec2(1.225, 0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.20), vec2(1.175, 0.25), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.25), vec2(1.225, 0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.30), vec2(1.175, 0.35), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.35), vec2(1.225, 0.40), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.40), vec2(1.175, 0.45), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.45), vec2(1.225, 0.50), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.50), vec2(1.175, 0.55), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.55), vec2(1.225, 0.60), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.60), vec2(1.175, 0.65), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.65), vec2(1.225, 0.70), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.70), vec2(1.175, 0.75), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.75), vec2(1.225, 0.80), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.80), vec2(1.175, 0.85), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.85), vec2(1.225, 0.90), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.90), vec2(1.175, 0.95), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.95), vec2(1.225, 1.00), 0.0, isect);\n'      +
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

    'scene29-ku-semi-planar':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.41, -0.4), vec2(0.39, -0.38), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.39, -0.38), vec2(0.41, -0.36), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.36), vec2(0.39, -0.34), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.34), vec2(0.41, -0.32), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.32), vec2(0.39, -0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.30), vec2(0.41, -0.28), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.28), vec2(0.39, -0.26), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.26), vec2(0.41, -0.24), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.24), vec2(0.39, -0.22), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.22), vec2(0.41, -0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.20), vec2(0.39, -0.18), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.18), vec2(0.41, -0.16), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.16), vec2(0.39, -0.14), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.14), vec2(0.41, -0.12), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.12), vec2(0.39, -0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.10), vec2(0.41, -0.08), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.08), vec2(0.39, -0.06), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.06), vec2(0.41, -0.04), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.04), vec2(0.39, -0.02), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.02), vec2(0.41, 0.0), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.0), vec2(0.39, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.39, 0.02), vec2(0.41, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.04), vec2(0.39, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.06), vec2(0.41, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.08), vec2(0.39, 0.10), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.10), vec2(0.41, 0.12), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.12), vec2(0.39, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.14), vec2(0.41, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.16), vec2(0.39, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.18), vec2(0.41, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.20), vec2(0.39, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.22), vec2(0.41, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.24), vec2(0.39, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.26), vec2(0.41, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.28), vec2(0.39, 0.30), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.30), vec2(0.41, 0.32), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.32), vec2(0.39, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.34), vec2(0.41, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.36), vec2(0.39, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.38), vec2(0.41, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20, 0.0), vec2(1.20, 1.00), 0.0, isect);\n'         +
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

    'scene30-ku-semi-semi':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.41, -0.4), vec2(0.39, -0.38), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.39, -0.38), vec2(0.41, -0.36), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.36), vec2(0.39, -0.34), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.34), vec2(0.41, -0.32), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.32), vec2(0.39, -0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.30), vec2(0.41, -0.28), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.28), vec2(0.39, -0.26), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.26), vec2(0.41, -0.24), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.24), vec2(0.39, -0.22), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.22), vec2(0.41, -0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.20), vec2(0.39, -0.18), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.18), vec2(0.41, -0.16), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.16), vec2(0.39, -0.14), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.14), vec2(0.41, -0.12), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.12), vec2(0.39, -0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.10), vec2(0.41, -0.08), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.08), vec2(0.39, -0.06), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.06), vec2(0.41, -0.04), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.04), vec2(0.39, -0.02), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.02), vec2(0.41, 0.0), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.0), vec2(0.39, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.39, 0.02), vec2(0.41, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.04), vec2(0.39, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.06), vec2(0.41, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.08), vec2(0.39, 0.10), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.10), vec2(0.41, 0.12), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.12), vec2(0.39, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.14), vec2(0.41, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.16), vec2(0.39, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.18), vec2(0.41, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.20), vec2(0.39, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.22), vec2(0.41, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.24), vec2(0.39, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.26), vec2(0.41, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.28), vec2(0.39, 0.30), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.30), vec2(0.41, 0.32), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.32), vec2(0.39, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.34), vec2(0.41, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.36), vec2(0.39, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.38), vec2(0.41, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.21, 0.0), vec2(1.19, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.02), vec2(1.21, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.04), vec2(1.19, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.06), vec2(1.21, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.08), vec2(1.19, 0.1), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.1), vec2(1.21, 0.12), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.12), vec2(1.19, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.14), vec2(1.21, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.16), vec2(1.19, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.18), vec2(1.21, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.20), vec2(1.19, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.22), vec2(1.21, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.24), vec2(1.19, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.26), vec2(1.21, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.28), vec2(1.19, 0.3), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.3), vec2(1.21, 0.32), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.32), vec2(1.19, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.34), vec2(1.21, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.36), vec2(1.19, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.38), vec2(1.21, 0.40), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.40), vec2(1.19, 0.42), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.42), vec2(1.21, 0.44), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.44), vec2(1.19, 0.463), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.463), vec2(1.21, 0.485), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.21, 0.485), vec2(1.19, 0.50), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.50), vec2(1.21, 0.52), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.52), vec2(1.19, 0.54), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.54), vec2(1.21, 0.56), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.56), vec2(1.19, 0.58), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.58), vec2(1.21, 0.60), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.60), vec2(1.19, 0.62), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.62), vec2(1.21, 0.64), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.64), vec2(1.19, 0.66), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.66), vec2(1.21, 0.68), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.68), vec2(1.19, 0.70), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.70), vec2(1.21, 0.72), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.72), vec2(1.19, 0.74), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.74), vec2(1.21, 0.76), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.76), vec2(1.19, 0.78), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.78), vec2(1.21, 0.80), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.80), vec2(1.19, 0.82), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.82), vec2(1.21, 0.84), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.84), vec2(1.19, 0.86), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.86), vec2(1.21, 0.88), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.88), vec2(1.19, 0.90), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.90), vec2(1.21, 0.92), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.92), vec2(1.19, 0.94), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.94), vec2(1.21, 0.96), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.96), vec2(1.19, 0.98), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.98), vec2(1.21, 1.00), 0.0, isect);\n'        +
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

    'scene31-ku-semi-rough':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.41, -0.4), vec2(0.39, -0.38), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(0.39, -0.38), vec2(0.41, -0.36), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.36), vec2(0.39, -0.34), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.34), vec2(0.41, -0.32), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.32), vec2(0.39, -0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.30), vec2(0.41, -0.28), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.28), vec2(0.39, -0.26), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.26), vec2(0.41, -0.24), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.24), vec2(0.39, -0.22), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.22), vec2(0.41, -0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.20), vec2(0.39, -0.18), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.18), vec2(0.41, -0.16), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.16), vec2(0.39, -0.14), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.14), vec2(0.41, -0.12), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.12), vec2(0.39, -0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.10), vec2(0.41, -0.08), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.08), vec2(0.39, -0.06), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.06), vec2(0.41, -0.04), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.41, -0.04), vec2(0.39, -0.02), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.39, -0.02), vec2(0.41, 0.0), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.0), vec2(0.39, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(0.39, 0.02), vec2(0.41, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.04), vec2(0.39, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.06), vec2(0.41, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.08), vec2(0.39, 0.10), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.10), vec2(0.41, 0.12), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.12), vec2(0.39, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.14), vec2(0.41, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.16), vec2(0.39, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.18), vec2(0.41, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.20), vec2(0.39, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.22), vec2(0.41, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.24), vec2(0.39, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.26), vec2(0.41, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.28), vec2(0.39, 0.30), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.30), vec2(0.41, 0.32), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.32), vec2(0.39, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.34), vec2(0.41, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.41, 0.36), vec2(0.39, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(0.39, 0.38), vec2(0.41, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.225, 0.00), vec2(1.175, 0.05), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.05), vec2(1.225, 0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.10), vec2(1.175, 0.15), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.15), vec2(1.225, 0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.20), vec2(1.175, 0.25), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.25), vec2(1.225, 0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.30), vec2(1.175, 0.35), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.35), vec2(1.225, 0.40), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.40), vec2(1.175, 0.45), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.45), vec2(1.225, 0.50), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.50), vec2(1.175, 0.55), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.55), vec2(1.225, 0.60), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.60), vec2(1.175, 0.65), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.65), vec2(1.225, 0.70), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.70), vec2(1.175, 0.75), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.75), vec2(1.225, 0.80), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.80), vec2(1.175, 0.85), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.85), vec2(1.225, 0.90), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.90), vec2(1.175, 0.95), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.95), vec2(1.225, 1.00), 0.0, isect);\n'      +
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

    'scene32-ku-rough-planar':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.425, -0.4), vec2(0.375, -0.35), 0.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.375, -0.35), vec2(0.425, -0.30), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.30), vec2(0.375, -0.25), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.25), vec2(0.425, -0.20), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.20), vec2(0.375, -0.15), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.15), vec2(0.425, -0.10), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.10), vec2(0.375, -0.05), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.05), vec2(0.425, 0.00), 0.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.425, 0.00), vec2(0.375, 0.05), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.05), vec2(0.425, 0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.10), vec2(0.375, 0.15), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.15), vec2(0.425, 0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.20), vec2(0.375, 0.25), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.25), vec2(0.425, 0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.30), vec2(0.375, 0.35), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.35), vec2(0.425, 0.40), 0.0, isect);\n\n'    +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20, 0.0), vec2(1.20, 1.00), 0.0, isect);\n'         +
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

    'scene33-ku-rough-semi':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.425, -0.4), vec2(0.375, -0.35), 0.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.375, -0.35), vec2(0.425, -0.30), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.30), vec2(0.375, -0.25), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.25), vec2(0.425, -0.20), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.20), vec2(0.375, -0.15), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.15), vec2(0.425, -0.10), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.10), vec2(0.375, -0.05), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.05), vec2(0.425, 0.00), 0.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.425, 0.00), vec2(0.375, 0.05), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.05), vec2(0.425, 0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.10), vec2(0.375, 0.15), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.15), vec2(0.425, 0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.20), vec2(0.375, 0.25), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.25), vec2(0.425, 0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.30), vec2(0.375, 0.35), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.35), vec2(0.425, 0.40), 0.0, isect);\n\n'    +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.21, 0.0), vec2(1.19, 0.02), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.02), vec2(1.21, 0.04), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.04), vec2(1.19, 0.06), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.06), vec2(1.21, 0.08), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.08), vec2(1.19, 0.1), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.1), vec2(1.21, 0.12), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.12), vec2(1.19, 0.14), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.14), vec2(1.21, 0.16), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.16), vec2(1.19, 0.18), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.18), vec2(1.21, 0.20), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.20), vec2(1.19, 0.22), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.22), vec2(1.21, 0.24), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.24), vec2(1.19, 0.26), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.26), vec2(1.21, 0.28), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.28), vec2(1.19, 0.3), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.19, 0.3), vec2(1.21, 0.32), 0.0, isect);\n'         +
        '    lineIntersect(ray, vec2(1.21, 0.32), vec2(1.19, 0.34), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.34), vec2(1.21, 0.36), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.36), vec2(1.19, 0.38), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.38), vec2(1.21, 0.40), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.40), vec2(1.19, 0.42), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.42), vec2(1.21, 0.44), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.44), vec2(1.19, 0.463), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.463), vec2(1.21, 0.485), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.21, 0.485), vec2(1.19, 0.50), 0.0, isect);\n'       +
        '    lineIntersect(ray, vec2(1.19, 0.50), vec2(1.21, 0.52), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.52), vec2(1.19, 0.54), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.54), vec2(1.21, 0.56), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.56), vec2(1.19, 0.58), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.58), vec2(1.21, 0.60), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.60), vec2(1.19, 0.62), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.62), vec2(1.21, 0.64), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.64), vec2(1.19, 0.66), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.66), vec2(1.21, 0.68), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.68), vec2(1.19, 0.70), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.70), vec2(1.21, 0.72), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.72), vec2(1.19, 0.74), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.74), vec2(1.21, 0.76), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.76), vec2(1.19, 0.78), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.78), vec2(1.21, 0.80), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.80), vec2(1.19, 0.82), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.82), vec2(1.21, 0.84), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.84), vec2(1.19, 0.86), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.86), vec2(1.21, 0.88), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.88), vec2(1.19, 0.90), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.90), vec2(1.21, 0.92), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.92), vec2(1.19, 0.94), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.94), vec2(1.21, 0.96), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.21, 0.96), vec2(1.19, 0.98), 0.0, isect);\n'        +
        '    lineIntersect(ray, vec2(1.19, 0.98), vec2(1.21, 1.00), 0.0, isect);\n'        +
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

    'scene34-ku-rough-rough':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.425, -0.4), vec2(0.375, -0.35), 0.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.375, -0.35), vec2(0.425, -0.30), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.30), vec2(0.375, -0.25), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.25), vec2(0.425, -0.20), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.20), vec2(0.375, -0.15), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.15), vec2(0.425, -0.10), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.425, -0.10), vec2(0.375, -0.05), 0.0, isect);\n'    +
        '    lineIntersect(ray, vec2(0.375, -0.05), vec2(0.425, 0.00), 0.0, isect);\n'     +
        '    lineIntersect(ray, vec2(0.425, 0.00), vec2(0.375, 0.05), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.05), vec2(0.425, 0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.10), vec2(0.375, 0.15), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.15), vec2(0.425, 0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.20), vec2(0.375, 0.25), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.25), vec2(0.425, 0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.425, 0.30), vec2(0.375, 0.35), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(0.375, 0.35), vec2(0.425, 0.40), 0.0, isect);\n\n'    +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.225, 0.00), vec2(1.175, 0.05), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.05), vec2(1.225, 0.10), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.10), vec2(1.175, 0.15), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.15), vec2(1.225, 0.20), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.20), vec2(1.175, 0.25), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.25), vec2(1.225, 0.30), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.30), vec2(1.175, 0.35), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.35), vec2(1.225, 0.40), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.40), vec2(1.175, 0.45), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.45), vec2(1.225, 0.50), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.50), vec2(1.175, 0.55), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.55), vec2(1.225, 0.60), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.60), vec2(1.175, 0.65), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.65), vec2(1.225, 0.70), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.70), vec2(1.175, 0.75), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.75), vec2(1.225, 0.80), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.80), vec2(1.175, 0.85), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.85), vec2(1.225, 0.90), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.225, 0.90), vec2(1.175, 0.95), 0.0, isect);\n'      +
        '    lineIntersect(ray, vec2(1.175, 0.95), vec2(1.225, 1.00), 0.0, isect);\n'      +
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

    'scene35-ku-facetsmall':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40452, -0.40392), vec2(0.39548, -0.38608), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39709, -0.39457), vec2(0.40291, -0.37543), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39135, -0.38003), vec2(0.40865, -0.36997), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40565, -0.37325), vec2(0.39435, -0.35675), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40385, -0.36423), vec2(0.39615, -0.34577), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40853, -0.35022), vec2(0.39147, -0.33978), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39486, -0.34358), vec2(0.40514, -0.32642), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39329, -0.33242), vec2(0.40671, -0.31758), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40074, -0.32497), vec2(0.39926, -0.30503), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39434, -0.31325), vec2(0.40566, -0.29675), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39405, -0.30304), vec2(0.40595, -0.28696), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39434, -0.29325), vec2(0.40566, -0.27675), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40760, -0.28150), vec2(0.39240, -0.26850), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40263, -0.27465), vec2(0.39737, -0.25535), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39689, -0.26450), vec2(0.40311, -0.24550), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39421, -0.25315), vec2(0.40579, -0.23685), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39181, -0.24074), vec2(0.40819, -0.22926), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39954, -0.23499), vec2(0.40046, -0.21501), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39148, -0.22023), vec2(0.40852, -0.20977), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40127, -0.21492), vec2(0.39873, -0.19508), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40122, -0.20493), vec2(0.39878, -0.18507), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39941, -0.19498), vec2(0.40059, -0.17502), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40762, -0.18147), vec2(0.39238, -0.16853), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40861, -0.17008), vec2(0.39139, -0.15992), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40375, -0.16427), vec2(0.39625, -0.14573), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39335, -0.15247), vec2(0.40665, -0.13753), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39985, -0.14500), vec2(0.40015, -0.12500), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39346, -0.13257), vec2(0.40654, -0.11743), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40699, -0.12215), vec2(0.39301, -0.10785), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39221, -0.11126), vec2(0.40779, -0.09874), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39349, -0.10259), vec2(0.40651, -0.08741), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40472, -0.09382), vec2(0.39528, -0.07618), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40047, -0.08499), vec2(0.39953, -0.06501), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40497, -0.07368), vec2(0.39503, -0.05632), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39575, -0.06405), vec2(0.40425, -0.04595), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39295, -0.05210), vec2(0.40705, -0.03790), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39611, -0.04421), vec2(0.40389, -0.02579), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39978, -0.03500), vec2(0.40022, -0.01500), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40509, -0.02361), vec2(0.39491, -0.00639), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39319, -0.01233), vec2(0.40681, 0.00233), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.39844, -0.00488), vec2(0.40156, 0.01488), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.40128, 0.00508), vec2(0.39872, 0.02492), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39608, 0.01580), vec2(0.40392, 0.03420), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39653, 0.02562), vec2(0.40347, 0.04438), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40826, 0.03937), vec2(0.39174, 0.05063), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40314, 0.04551), vec2(0.39686, 0.06449), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39153, 0.05968), vec2(0.40847, 0.07032), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40717, 0.06803), vec2(0.39283, 0.08197), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39229, 0.07863), vec2(0.40771, 0.09137), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39944, 0.08502), vec2(0.40056, 0.10498), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40430, 0.09597), vec2(0.39570, 0.11403), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39306, 0.10780), vec2(0.40694, 0.12220), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40469, 0.11617), vec2(0.39531, 0.13383), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40420, 0.12592), vec2(0.39580, 0.14408), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40585, 0.13689), vec2(0.39415, 0.15311), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39202, 0.14898), vec2(0.40798, 0.16102), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40692, 0.15778), vec2(0.39308, 0.17222), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39898, 0.16505), vec2(0.40102, 0.18495), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40592, 0.17694), vec2(0.39408, 0.19306), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40686, 0.18772), vec2(0.39314, 0.20228), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39350, 0.19740), vec2(0.40650, 0.21260), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40426, 0.20595), vec2(0.39574, 0.22405), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39875, 0.21508), vec2(0.40125, 0.23492), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39854, 0.22511), vec2(0.40146, 0.24489), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39169, 0.23944), vec2(0.40831, 0.25056), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39151, 0.24972), vec2(0.40849, 0.26028), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40438, 0.25601), vec2(0.39562, 0.27399), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40049, 0.26501), vec2(0.39951, 0.28499), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39160, 0.27957), vec2(0.40840, 0.29043), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39189, 0.28914), vec2(0.40811, 0.30086), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39871, 0.29508), vec2(0.40129, 0.31492), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39427, 0.30680), vec2(0.40573, 0.32320), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40523, 0.31647), vec2(0.39477, 0.33353), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40851, 0.32975), vec2(0.39149, 0.34025), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39673, 0.33555), vec2(0.40327, 0.35445), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39814, 0.34518), vec2(0.40186, 0.36482), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40535, 0.35655), vec2(0.39465, 0.37345), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40613, 0.36710), vec2(0.39387, 0.38290), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39483, 0.37644), vec2(0.40517, 0.39356), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39919, 0.38503), vec2(0.40081, 0.40497), 0.0, isec' +
                                                                                 't);\n\n' +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20656, -0.00254), vec2(1.19344, 0.01254), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(1.20489, 0.00628), vec2(1.19511, 0.02372), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20638, 0.01730), vec2(1.19362, 0.03270), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20625, 0.02720), vec2(1.19375, 0.04280), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20048, 0.03501), vec2(1.19952, 0.05499), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20781, 0.04876), vec2(1.19219, 0.06124), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19873, 0.05508), vec2(1.20127, 0.07492), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19384, 0.06712), vec2(1.20616, 0.08288), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20661, 0.07750), vec2(1.19339, 0.09250), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19890, 0.08506), vec2(1.20110, 0.10494), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19467, 0.09654), vec2(1.20533, 0.11346), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20730, 0.10817), vec2(1.19270, 0.12183), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19224, 0.11869), vec2(1.20776, 0.13131), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20359, 0.12567), vec2(1.19641, 0.14433), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20616, 0.13712), vec2(1.19384, 0.15288), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19584, 0.14590), vec2(1.20416, 0.16410), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19535, 0.15615), vec2(1.20465, 0.17385), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20541, 0.16659), vec2(1.19459, 0.18341), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19535, 0.17614), vec2(1.20465, 0.19386), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19981, 0.18500), vec2(1.20019, 0.20500), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20531, 0.19652), vec2(1.19469, 0.21348), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19419, 0.20686), vec2(1.20581, 0.22314), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20647, 0.21737), vec2(1.19353, 0.23263), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20391, 0.22580), vec2(1.19609, 0.24420), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20075, 0.23503), vec2(1.19925, 0.25497), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19851, 0.24511), vec2(1.20149, 0.26489), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20333, 0.25557), vec2(1.19667, 0.27443), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20144, 0.26510), vec2(1.19856, 0.28490), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20820, 0.27927), vec2(1.19180, 0.29073), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19804, 0.28519), vec2(1.20196, 0.30481), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20858, 0.29986), vec2(1.19142, 0.31014), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20506, 0.30638), vec2(1.19494, 0.32362), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20774, 0.31867), vec2(1.19226, 0.33133), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20777, 0.32871), vec2(1.19223, 0.34129), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20110, 0.33506), vec2(1.19890, 0.35494), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20490, 0.34628), vec2(1.19510, 0.36372), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19312, 0.35775), vec2(1.20688, 0.37225), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20476, 0.36621), vec2(1.19524, 0.38379), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20293, 0.37544), vec2(1.19707, 0.39456), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19378, 0.38717), vec2(1.20622, 0.40283), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19606, 0.39581), vec2(1.20394, 0.41419), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20035, 0.40501), vec2(1.19965, 0.42499), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20680, 0.41767), vec2(1.19320, 0.43233), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20444, 0.42604), vec2(1.19556, 0.44396), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19374, 0.43720), vec2(1.20626, 0.45280), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19347, 0.44742), vec2(1.20653, 0.46258), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19301, 0.45785), vec2(1.20699, 0.47215), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20267, 0.46536), vec2(1.19733, 0.48464), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20232, 0.47527), vec2(1.19768, 0.49473), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19528, 0.48618), vec2(1.20472, 0.50382), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19145, 0.49981), vec2(1.20855, 0.51019), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19979, 0.50500), vec2(1.20021, 0.52500), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20218, 0.51524), vec2(1.19782, 0.53476), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20672, 0.52760), vec2(1.19328, 0.54240), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19493, 0.53638), vec2(1.20507, 0.55362), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19716, 0.54541), vec2(1.20284, 0.56459), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20687, 0.55773), vec2(1.19313, 0.57227), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19469, 0.56653), vec2(1.20531, 0.58347), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19481, 0.57645), vec2(1.20519, 0.59355), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19274, 0.58812), vec2(1.20726, 0.60188), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19718, 0.59541), vec2(1.20282, 0.61459), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19972, 0.60500), vec2(1.20028, 0.62500), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19994, 0.61500), vec2(1.20006, 0.63500), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20801, 0.62901), vec2(1.19199, 0.64099), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20374, 0.63572), vec2(1.19626, 0.65428), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20782, 0.64877), vec2(1.19218, 0.66123), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19731, 0.65537), vec2(1.20269, 0.67463), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19367, 0.66726), vec2(1.20633, 0.68274), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20727, 0.67814), vec2(1.19273, 0.69186), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20471, 0.68618), vec2(1.19529, 0.70382), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20537, 0.69656), vec2(1.19463, 0.71344), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19905, 0.70505), vec2(1.20095, 0.72495), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20782, 0.71877), vec2(1.19218, 0.73123), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19431, 0.72678), vec2(1.20569, 0.74322), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19483, 0.73644), vec2(1.20517, 0.75356), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19411, 0.74692), vec2(1.20589, 0.76308), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20095, 0.75505), vec2(1.19905, 0.77495), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19849, 0.76511), vec2(1.20151, 0.78489), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20591, 0.77693), vec2(1.19409, 0.79307), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19273, 0.78813), vec2(1.20727, 0.80187), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20675, 0.79762), vec2(1.19325, 0.81238), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19381, 0.80715), vec2(1.20619, 0.82285), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19314, 0.81772), vec2(1.20686, 0.83228), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19639, 0.82567), vec2(1.20361, 0.84433), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20611, 0.83708), vec2(1.19389, 0.85292), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20268, 0.84537), vec2(1.19732, 0.86463), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20590, 0.85693), vec2(1.19410, 0.87307), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20710, 0.86796), vec2(1.19290, 0.88204), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19448, 0.87666), vec2(1.20552, 0.89334), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20664, 0.88752), vec2(1.19336, 0.90248), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19370, 0.89723), vec2(1.20630, 0.91277), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19186, 0.90920), vec2(1.20814, 0.92080), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20143, 0.91510), vec2(1.19857, 0.93490), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20573, 0.92681), vec2(1.19427, 0.94319), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19217, 0.93877), vec2(1.20783, 0.95123), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19240, 0.94850), vec2(1.20760, 0.96150), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20306, 0.95548), vec2(1.19694, 0.97452), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20388, 0.96578), vec2(1.19612, 0.98422), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20839, 0.97956), vec2(1.19161, 0.99044), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20052, 0.98501), vec2(1.19948, 1.00499), 0.0, isec' +
                                                                                 't);\n'   +
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

    'scene36-ku-facetmedium':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.41140, -0.40644), vec2(0.38860, -0.37356), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.41583, -0.38222), vec2(0.38417, -0.35778), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40507, -0.36935), vec2(0.39493, -0.33065), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.41704, -0.34047), vec2(0.38296, -0.31953), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.41654, -0.32125), vec2(0.38346, -0.29875), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39498, -0.30936), vec2(0.40502, -0.27064), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.41432, -0.28397), vec2(0.38568, -0.25603), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39320, -0.26881), vec2(0.40680, -0.23119), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38413, -0.24217), vec2(0.41587, -0.21783), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39006, -0.22735), vec2(0.40994, -0.19265), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.41526, -0.20293), vec2(0.38474, -0.17707), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38385, -0.18179), vec2(0.41615, -0.15821), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39346, -0.16890), vec2(0.40654, -0.13110), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.41091, -0.14676), vec2(0.38909, -0.11324), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40893, -0.12789), vec2(0.39107, -0.09211), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39805, -0.10991), vec2(0.40195, -0.07009), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40286, -0.08979), vec2(0.39714, -0.05021), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39916, -0.06998), vec2(0.40084, -0.03002), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.39935, -0.04999), vec2(0.40065, -0.01001), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38712, -0.02530), vec2(0.41288, 0.00530), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.40645, -0.00893), vec2(0.39355, 0.02893), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.38853, 0.01361), vec2(0.41147, 0.04639), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39230, 0.03154), vec2(0.40770, 0.06846), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.41261, 0.05447), vec2(0.38739, 0.08553), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39694, 0.07023), vec2(0.40306, 0.10977), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.41479, 0.09653), vec2(0.38521, 0.12347), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.38683, 0.11495), vec2(0.41317, 0.14505), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39208, 0.13164), vec2(0.40792, 0.16836), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39610, 0.15038), vec2(0.40390, 0.18962), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.41595, 0.17794), vec2(0.38405, 0.20206), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.38951, 0.19297), vec2(0.41049, 0.22703), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40611, 0.21096), vec2(0.39389, 0.24904), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.41090, 0.23323), vec2(0.38910, 0.26677), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.38769, 0.25424), vec2(0.41231, 0.28576), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39187, 0.27173), vec2(0.40813, 0.30827), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.38895, 0.29333), vec2(0.41105, 0.32667), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.38787, 0.31409), vec2(0.41213, 0.34591), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40186, 0.33009), vec2(0.39814, 0.36991), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.40825, 0.35178), vec2(0.39175, 0.38822), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39546, 0.37052), vec2(0.40454, 0.40948), 0.0, isec' +
                                                                                 't);\n\n' +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20316, -0.00975), vec2(1.19684, 0.02975), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(1.20058, 0.01001), vec2(1.19942, 0.04999), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18631, 0.03542), vec2(1.21369, 0.06458), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18607, 0.05565), vec2(1.21393, 0.08435), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21350, 0.07524), vec2(1.18650, 0.10476), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19076, 0.09226), vec2(1.20924, 0.12774), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21402, 0.11573), vec2(1.18598, 0.14427), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18834, 0.13375), vec2(1.21166, 0.16625), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18717, 0.15466), vec2(1.21283, 0.18534), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19700, 0.17023), vec2(1.20300, 0.20977), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20707, 0.19129), vec2(1.19293, 0.22871), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20083, 0.21002), vec2(1.19917, 0.24998), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19069, 0.23230), vec2(1.20931, 0.26770), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19984, 0.25000), vec2(1.20016, 0.29000), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19042, 0.27244), vec2(1.20958, 0.30756), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19001, 0.29267), vec2(1.20999, 0.32733), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20334, 0.31028), vec2(1.19666, 0.34972), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21497, 0.33674), vec2(1.18503, 0.36326), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18437, 0.35752), vec2(1.21563, 0.38248), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20276, 0.37019), vec2(1.19724, 0.40981), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21287, 0.39469), vec2(1.18713, 0.42531), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18319, 0.41917), vec2(1.21681, 0.44083), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21654, 0.43875), vec2(1.18346, 0.46125), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18433, 0.45757), vec2(1.21567, 0.48243), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19265, 0.47140), vec2(1.20735, 0.50860), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20815, 0.49174), vec2(1.19185, 0.52826), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21229, 0.51422), vec2(1.18771, 0.54578), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18287, 0.53968), vec2(1.21713, 0.56032), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19539, 0.55054), vec2(1.20461, 0.58946), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21102, 0.57331), vec2(1.18898, 0.60669), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21626, 0.59835), vec2(1.18374, 0.62165), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18383, 0.61823), vec2(1.21617, 0.64177), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21436, 0.63608), vec2(1.18564, 0.66392), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21196, 0.65397), vec2(1.18804, 0.68603), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21549, 0.67735), vec2(1.18451, 0.70265), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21624, 0.69833), vec2(1.18376, 0.72167), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20842, 0.71186), vec2(1.19158, 0.74814), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18969, 0.73286), vec2(1.21031, 0.76714), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20824, 0.75178), vec2(1.19176, 0.78822), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18938, 0.77305), vec2(1.21062, 0.80695), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18316, 0.79921), vec2(1.21684, 0.82079), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21498, 0.81675), vec2(1.18502, 0.84325), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18404, 0.83795), vec2(1.21596, 0.86205), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20693, 0.85124), vec2(1.19307, 0.88876), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19888, 0.87003), vec2(1.20112, 0.90997), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18560, 0.89612), vec2(1.21440, 0.92388), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18591, 0.91580), vec2(1.21409, 0.94420), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18889, 0.93337), vec2(1.21111, 0.96663), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21182, 0.95387), vec2(1.18818, 0.98613), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21276, 0.97460), vec2(1.18724, 1.00540), 0.0, isec' +
                                                                                 't);\n'   +
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

    'scene37-ku-facetbig':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.43078, -0.40555), vec2(0.36922, -0.35445), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.42688, -0.36962), vec2(0.37312, -0.31038), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.40759, -0.33927), vec2(0.39241, -0.26073), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38457, -0.29691), vec2(0.41543, -0.22309), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.42934, -0.24719), vec2(0.37066, -0.19281), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.37434, -0.21068), vec2(0.42566, -0.14932), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38599, -0.17747), vec2(0.41401, -0.10253), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.38403, -0.13667), vec2(0.41597, -0.06333), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.42081, -0.09416), vec2(0.37919, -0.02584), 0.0, is' +
                                                                               'ect);\n'   +
        '    lineIntersect(ray, vec2(0.36790, -0.04386), vec2(0.43210, 0.00386), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.42394, -0.01204), vec2(0.37606, 0.05204), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(0.39603, 0.02020), vec2(0.40397, 0.09980), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.37822, 0.06645), vec2(0.42178, 0.13355), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.37088, 0.11257), vec2(0.42912, 0.16743), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.36619, 0.15862), vec2(0.43381, 0.20138), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39799, 0.18005), vec2(0.40201, 0.25995), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.39799, 0.22005), vec2(0.40201, 0.29995), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.42993, 0.27346), vec2(0.37007, 0.32654), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.37230, 0.31115), vec2(0.42770, 0.36885), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(0.41073, 0.34147), vec2(0.38927, 0.41853), 0.0, isec' +
                                                                                 't);\n\n' +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20477, -0.01971), vec2(1.19523, 0.05971), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(1.21498, 0.02291), vec2(1.18502, 0.09709), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18045, 0.06510), vec2(1.21955, 0.13490), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21336, 0.10230), vec2(1.18664, 0.17770), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.23393, 0.15882), vec2(1.16607, 0.20118), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21246, 0.18199), vec2(1.18754, 0.25801), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.23429, 0.23941), vec2(1.16571, 0.28059), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20957, 0.26116), vec2(1.19043, 0.33884), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18721, 0.30210), vec2(1.21279, 0.37790), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18469, 0.34305), vec2(1.21531, 0.41695), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.22131, 0.38615), vec2(1.17869, 0.45385), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20964, 0.42118), vec2(1.19036, 0.49882), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.22427, 0.46820), vec2(1.17573, 0.53180), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.22920, 0.51266), vec2(1.17080, 0.56734), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20536, 0.54036), vec2(1.19464, 0.61964), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20605, 0.58046), vec2(1.19395, 0.65954), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20908, 0.62104), vec2(1.19092, 0.69896), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.17919, 0.66584), vec2(1.22081, 0.73416), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20297, 0.70011), vec2(1.19703, 0.77989), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.22676, 0.75027), vec2(1.17324, 0.80973), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.17565, 0.78826), vec2(1.22435, 0.85174), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.23224, 0.83632), vec2(1.16776, 0.88368), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18118, 0.86470), vec2(1.21882, 0.93530), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.22847, 0.91190), vec2(1.17153, 0.96810), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18149, 0.94454), vec2(1.21851, 1.01546), 0.0, isec' +
                                                                                 't);\n'   +
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

    'scene38-ku-facetplanarmedium':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40, -0.40), vec2(0.40, 0.40), 0.0, isect);\n\n'     +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.20316, -0.00975), vec2(1.19684, 0.02975), 0.0, ise' +
                                                                                'ct);\n'   +
        '    lineIntersect(ray, vec2(1.20058, 0.01001), vec2(1.19942, 0.04999), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18631, 0.03542), vec2(1.21369, 0.06458), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18607, 0.05565), vec2(1.21393, 0.08435), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21350, 0.07524), vec2(1.18650, 0.10476), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19076, 0.09226), vec2(1.20924, 0.12774), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21402, 0.11573), vec2(1.18598, 0.14427), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18834, 0.13375), vec2(1.21166, 0.16625), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18717, 0.15466), vec2(1.21283, 0.18534), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19700, 0.17023), vec2(1.20300, 0.20977), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20707, 0.19129), vec2(1.19293, 0.22871), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20083, 0.21002), vec2(1.19917, 0.24998), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19069, 0.23230), vec2(1.20931, 0.26770), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19984, 0.25000), vec2(1.20016, 0.29000), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19042, 0.27244), vec2(1.20958, 0.30756), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19001, 0.29267), vec2(1.20999, 0.32733), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20334, 0.31028), vec2(1.19666, 0.34972), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21497, 0.33674), vec2(1.18503, 0.36326), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18437, 0.35752), vec2(1.21563, 0.38248), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20276, 0.37019), vec2(1.19724, 0.40981), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21287, 0.39469), vec2(1.18713, 0.42531), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18319, 0.41917), vec2(1.21681, 0.44083), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21654, 0.43875), vec2(1.18346, 0.46125), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18433, 0.45757), vec2(1.21567, 0.48243), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19265, 0.47140), vec2(1.20735, 0.50860), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20815, 0.49174), vec2(1.19185, 0.52826), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21229, 0.51422), vec2(1.18771, 0.54578), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18287, 0.53968), vec2(1.21713, 0.56032), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19539, 0.55054), vec2(1.20461, 0.58946), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21102, 0.57331), vec2(1.18898, 0.60669), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21626, 0.59835), vec2(1.18374, 0.62165), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18383, 0.61823), vec2(1.21617, 0.64177), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21436, 0.63608), vec2(1.18564, 0.66392), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21196, 0.65397), vec2(1.18804, 0.68603), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21549, 0.67735), vec2(1.18451, 0.70265), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21624, 0.69833), vec2(1.18376, 0.72167), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20842, 0.71186), vec2(1.19158, 0.74814), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18969, 0.73286), vec2(1.21031, 0.76714), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20824, 0.75178), vec2(1.19176, 0.78822), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18938, 0.77305), vec2(1.21062, 0.80695), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18316, 0.79921), vec2(1.21684, 0.82079), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21498, 0.81675), vec2(1.18502, 0.84325), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18404, 0.83795), vec2(1.21596, 0.86205), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.20693, 0.85124), vec2(1.19307, 0.88876), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.19888, 0.87003), vec2(1.20112, 0.90997), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18560, 0.89612), vec2(1.21440, 0.92388), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18591, 0.91580), vec2(1.21409, 0.94420), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.18889, 0.93337), vec2(1.21111, 0.96663), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21182, 0.95387), vec2(1.18818, 0.98613), 0.0, isec' +
                                                                                 't);\n'   +
        '    lineIntersect(ray, vec2(1.21276, 0.97460), vec2(1.18724, 1.00540), 0.0, isec' +
                                                                                 't);\n'   +
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

    'scene42-ku-planar-rotatedplanar':
        '#include "trace-frag"\n\n'                                                        +

        '#include "bsdf"\n'                                                                +
        '#include "intersect"\n\n'                                                         +

        'void intersect(Ray ray, inout Intersection isect) {\n'                            +
        '    bboxIntersect(ray, vec2(0.0), vec2(1.79, 1.0), 3.0, isect);\n\n'              +

        '    // relay wall\n'                                                              +
        '    lineIntersect(ray, vec2(1.2, -1.0), vec2(1.2, -0.2), 0.0, isect);\n\n'        +

        '    // first hidden wall (mirror wall)\n'                                         +
        '    lineIntersect(ray, vec2(0.40, -0.4), vec2(0.40, 0.40), 0.0, isect);\n\n'      +

        '    // doubly-hidden wall\n'                                                      +
        '    lineIntersect(ray, vec2(1.8, 0.0), vec2(1.0, 1.0), 0.0, isect);\n'            +
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