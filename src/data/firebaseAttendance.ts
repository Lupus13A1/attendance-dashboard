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
    const attendanceRef = collection(db, "attendanceLogs");

    const attQuery =
      role === "student"
        ? query(attendanceRef, where("uid", "==", uid))
        : attendanceRef;

    const attSnap = await getDocs(attQuery);

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

    const records: AttendanceRecord[] = attSnap.docs.map((docSnap) => {
      const data = docSnap.data();
      const user = userMap.get(data.uid);

      let status: AttendanceStatus ;

      if (data.type === "check-out") {
        status = "out";
      } else if (data.status) {
        const s = data.status.toLowerCase();
        if (s === "present") status = "present";
        else if (s === "late") status = "late";
        else if (s === "absent") status = "absent";
      }

      const dateObj =
        data.timestamp instanceof Timestamp
          ? data.timestamp.toDate()
          : new Date();

      const iso = dateObj.toISOString();

      return {
        id: docSnap.id,

        uid: data.uid ?? "",

        studentId: user?.id ?? "",

        rfid: user?.rfid ?? "",
        name: user?.name ?? "Unknown",
        imgUrl: user?.imgUrl ?? "",
        snapshotImg: data.image ?? data.imgUrl ?? null,


        status,
        type: data.type ?? "check-in",

        timestamp: iso,
        date: iso,
        createdAt: iso,
        updatedAt: iso,

        section: user?.section ?? "",
        classroom: user?.classroom ?? "",
      };
    });



    return records;
  } catch (error) {
    console.error("❌ fetchAttendanceFromFirebase error:", error);
    return [];
  }
}