import re

def append_points_from_string(s, p1, p2):
    s = re.sub("vec2\(", "", s)
    s = re.sub("\)", "", s)
    s = s.split(', ')
    p1.append([float(s[0]), float(s[1])])
    p2.append([float(s[2]), float(s[3])])

if __name__ == '__main__':
    # filename = 'shaders/scene29-ku-semi-planar.txt'
    # filename2 = 'ray-optics-configs/ku-semi-planar-ray-optics.json'
    # filename = 'shaders/scene32-ku-rough-planar.txt'
    # filename2 = 'ray-optics-configs/ku-rough-planar-ray-optics.json'
    # filename = 'shaders/scene35-ku-facetsmall.txt'
    # filename2 = 'ray-optics-configs/ku-facetsmall-ray-optics.json'
    # filename = 'shaders/scene36-ku-facetmedium.txt'
    # filename2 = 'ray-optics-configs/ku-facetmedium-ray-optics.json'
    filename = 'shaders/scene15.txt'
    filename2 = 'ray-optics-configs/rotated-ray-optics.json'


    f = open(filename, 'r')
    lines = f.readlines()
    f.close()
    parsedLines = []
    p1 = []
    p2 = []

    for line in lines:
        if "lineIntersect" in line:
            line = line.strip()
            line = re.sub("lineIntersect\(ray, ", "", line)
            line = re.sub(", [0-9].0, isect\);", "", line)
            append_points_from_string(line, p1, p2)

    jsonText = """{
    "version": 2,
    "objs": ["""
    for vert in zip(p1, p2):
        jsonText += f"""
        {{
            "type": "mirror",
            "p1": {{
                "type": 1,
                "x": {240 + 200*vert[0][0]},
                "y": {200 + 200*vert[0][1]},
                "exist": true
            }},
            "p2": {{
                "type": 1,
                "x": {240 + 200*vert[1][0]},
                "y": {200 + 200*vert[1][1]},
                "exist": true
            }}
        }},"""
    jsonText = jsonText[:-1]
    jsonText += """
    ],
    "mode": "light",
    "rayDensity_light": 0.11358543431204121,
    "rayDensity_images": 1,
    "showGrid": true,
    "grid": false,
    "lockobjs": false,
    "gridSize": 20,
    "observer": null,
    "origin": {
        "x": 100,
        "y": 100
    },
    "scale": 1.25,
    "width": 2000,
    "height": 1000,
    "colorMode": false,
    "symbolicGrin": false
}"""

    f = open(filename2, 'w')
    f.write(jsonText)
    f.close()