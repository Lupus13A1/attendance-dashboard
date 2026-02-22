// src/data/firebaseAttendance.ts

import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  AttendanceRecord,
  AttendanceStatus,
} from "@/types/attendance";

export async function fetchAttendanceFromFirebase(
  uid: string,
  role: string
): Promise<AttendanceRecord[]> {
  try {
    /* =========================
       1️⃣ BUILD QUERY BY ROLE
    ========================== */
    const attendanceRef = collection(db, "attendanceLogs");

    const attQuery =
      role === "student"
        ? query(attendanceRef, where("uid", "==", uid))
        : attendanceRef;

    const attSnap = await getDocs(attQuery);

    /* =========================
       2️⃣ LOAD USERS
    ========================== */
    const userMap = new Map<string, any>();

    if (role === "student") {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        userMap.set(uid, userDoc.data());
      }
    } else {
      const usersSnap = await getDocs(collection(db, "users"));
      usersSnap.forEach((u) => {
        userMap.set(u.id, u.data());
      });
    }

    /* =========================
       3️⃣ MAP TO AttendanceRecord
    ========================== */

    const records: AttendanceRecord[] = attSnap.docs.map(
      (docSnap) => {
        const data = docSnap.data();
        const user = userMap.get(data.uid);

        /* 🔥 บังคับ check-out = out */
        const status: AttendanceStatus =
          data.type === "check-out"
            ? "out"
            : data.status
            ? (data.status.toLowerCase() as AttendanceStatus)
            : "absent";

        const timestampISO =
          data.timestamp instanceof Timestamp
            ? data.timestamp.toDate().toISOString()
            : new Date().toISOString();

        return {
          id: docSnap.id,

          uid: data.uid ?? "",
          studentId: user?.id ?? "",
          rfid: user?.rfid ?? "",

          name: user?.name ?? "Unknown",
          imgUrl: user?.imgUrl ?? "",

          status,
          type: data.type ?? "check-in",

          timestamp: timestampISO,
          createdAt: timestampISO,
          updatedAt: timestampISO,

          section: user?.section ?? "",
          classroom: user?.classroom ?? "",
        };
      }
    );

    return records;
  } catch (error) {
    console.error("❌ fetchAttendanceFromFirebase error:", error);
    return [];
  }
}