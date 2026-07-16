import cv2
import mediapipe as mp
import csv
import os

# MediaPipe setup
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    max_num_hands=1,
    min_detection_confidence=0.7
)

# CSV file path
current_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(current_dir, "..", "dataset", "dataset.csv")
# Label for current gesture
label = "Y"

# Create CSV header if file is empty
if not os.path.exists(csv_path) or os.path.getsize(csv_path) == 0:
    with open(csv_path, "w", newline="") as f:
        writer = csv.writer(f)

        header = []
        for i in range(21):
            header += [f"x{i}", f"y{i}", f"z{i}"]

        header.append("label")
        writer.writerow(header)


cap = cv2.VideoCapture(0)

print("Press 's' to save a sample")
print("Press 'q' to quit")

while True:
    success, frame = cap.read()

    if not success:
        break

    frame = cv2.flip(frame, 1)

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    result = hands.process(rgb)

    if result.multi_hand_landmarks:
        print("Hand detected")

        for hand_landmarks in result.multi_hand_landmarks:

            mp_draw.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS
            )


    cv2.imshow("Collect Data", frame)

    key = cv2.waitKey(1)

    # Save landmark data
    if key == ord('s'):

        if result.multi_hand_landmarks:

            row = []

            for lm in result.multi_hand_landmarks[0].landmark:
                row.extend([lm.x, lm.y, lm.z])

            row.append(label)

            with open(csv_path, "a", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(row)

            print("Sample saved for label:", label)

        else:
            print("No hand detected")


    if key == ord('q'):
        break


cap.release()
cv2.destroyAllWindows()