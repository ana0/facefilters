import os
import cv2
import openface.openface as openface
from PIL import Image, ImageDraw

fileDir = os.path.dirname(os.path.realpath(__file__))
modelDir = os.path.join(fileDir, 'openface', 'models')
filesDir = os.path.join(fileDir, '4-frames')
dlibModelDir = os.path.join(modelDir, 'dlib')
openfaceModelDir = os.path.join(modelDir, 'openface')
dlibFacePredictor = os.path.join(
    dlibModelDir,
    "shape_predictor_68_face_landmarks.dat")

# file = os.path.join(filesDir, 'Sequence 02487.jpg')

networkModel = os.path.join(openfaceModelDir, 'nn4.small2.v1.t7')
imgDim = 96
cuda = False

align = openface.AlignDlib(dlibFacePredictor)
net = openface.TorchNeuralNet(
    networkModel,
    imgDim=imgDim,
    cuda=cuda)

def expandBB(bb):
    cc = [(bb.tl_corner().x, bb.tl_corner().y),
        (bb.tr_corner().x, bb.tr_corner().y),
        (bb.br_corner().x, bb.br_corner().y),
        (bb.bl_corner().x, bb.bl_corner().y),
        (bb.tl_corner().x, bb.tl_corner().y)]
    return cc

def loadImg(bgrImg, filename):
    rgbImg = cv2.cvtColor(bgrImg, cv2.COLOR_BGR2RGB)
    #rgbImg = bgrImg
    pil_im = Image.fromarray(rgbImg)
    bb = align.getAllFaceBoundingBoxes(rgbImg)
    if bb is None:
        return None
    # alignedFaces = []
    for box in bb:
        expanded = expandBB(box)
        draw = ImageDraw.Draw(pil_im)
        draw.line(expanded, fill=(0,255,0), width=8)
        pil_im.save(filename)
    #     alignedFaces.append(
    #         align.align(
    #             imgDim,
    #             rgbImg,
    #             box,
    #             landmarkIndices=openface.AlignDlib.OUTER_EYES_AND_NOSE))
    # if alignedFaces is None:
    #     raise Exception("Unable to align the frame")
    # reps = []
    # for alignedFace in alignedFaces:
    #     print(alignedFace)
    #     reps.append(net.forward(alignedFace))
    # return (reps)

def run():
    for file in os.listdir(filesDir):
        filename = os.fsdecode(file)
        print(filename)
        img = cv2.imread(os.path.join(filesDir, filename))
        loaded = loadImg(img, os.path.join(filesDir, filename))

if __name__ == "__main__":
    run()