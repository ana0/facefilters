import os
import openface.openface as openface

fileDir = os.path.dirname(os.path.realpath(__file__))
modelDir = os.path.join(fileDir, '..', 'openface', 'models')
dlibModelDir = os.path.join(modelDir, 'dlib')
openfaceModelDir = os.path.join(modelDir, 'openface')

networkModel = os.path.join(openfaceModelDir, 'nn4.small2.v1.t7')
imgDim = 96
cuda = True

def run():
    net = openface.TorchNeuralNet(
        networkModel,
        imgDim=imgDim,
        cuda=cuda)

if __name__ == "__main__":
    run()