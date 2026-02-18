import numpy as np

P = np.array([
    [0,   1/3, 1/3, 1/3, 0,   0],
    [1/3, 0,   1/3, 0,   1/3, 0],
    [1/3, 1/3, 0,   1/3,   0, 0],
    [1/3, 0,   1/3, 0,   0,   1/3],
    [0,   1/2, 0,   0,   0,   1/2],
    [0,   0,   0,   1/2, 1/2, 0]
])

# Raise to a high power
P_100 = np.linalg.matrix_power(P, 100)
print(P_100)