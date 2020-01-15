import os
import cv2
import openface.openface as openface

fileDir = os.path.dirname(os.path.realpath(__file__))
modelDir = os.path.join(fileDir, 'openface', 'models')
filesDir = os.path.join(fileDir, 'blobframes')
dlibModelDir = os.path.join(modelDir, 'dlib')
openfaceModelDir = os.path.join(modelDir, 'openface')
dlibFacePredictor = os.path.join(
    dlibModelDir,
    "shape_predictor_68_face_landmarks.dat")

file = os.path.join(filesDir, 'Sequence 02000.jpg')

networkModel = os.path.join(openfaceModelDir, 'nn4.small2.v1.t7')
imgDim = 96
cuda = False

align = openface.AlignDlib(dlibFacePredictor)
net = openface.TorchNeuralNet(
    networkModel,
    imgDim=imgDim,
    cuda=cuda)

def loadImg(bgrImg):
    rgbImg = cv2.cvtColor(bgrImg, cv2.COLOR_BGR2RGB)
    bb = align.getAllFaceBoundingBoxes(rgbImg)
    if bb is None:
        return None
    alignedFaces = []
    for box in bb:
        print(box)
        alignedFaces.append(
            align.align(
                imgDim,
                rgbImg,
                box,
                landmarkIndices=openface.AlignDlib.OUTER_EYES_AND_NOSE))
    if alignedFaces is None:
        raise Exception("Unable to align the frame")
    reps = []
    for alignedFace in alignedFaces:
        print(alignedFace)
        reps.append(net.forward(alignedFace))
    return (reps)

def run():
    img = cv2.imread(file, 0)
    loaded = loadImg(img)
    print("Loaded")
    print(len(loaded))

if __name__ == "__main__":
    run()