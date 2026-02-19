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
import { AttendanceLog, AttendanceStatus } from "@/types/attendance";

/* =====================================================
   FETCH ATTENDANCE LOGS FROM FIREBASE
===================================================== */
export async function fetchAttendanceFromFirebase(
  uid: string,
  role: string,
): Promise<AttendanceLog[]> {
  try {
    /* =========================
       1️⃣ BUILD QUERY BY ROLE
    ========================== */
    let attQuery;

    if (role === "student") {
      attQuery = query(
        collection(db, "attendanceLogs"),
        where("uid", "==", uid),
      );
    } else {
      // admin / teacher
      attQuery = collection(db, "attendanceLogs");
    }

    const attSnap = await getDocs(attQuery);

    /* =========================
       2️⃣ LOAD USER DATA
    ========================== */
    const userMap = new Map<string, any>();

    if (role !== "student") {
      // admin / teacher โหลด users ทั้งหมด
      const usersSnap = await getDocs(collection(db, "users"));
      usersSnap.forEach((docSnap) => {
        userMap.set(docSnap.id, docSnap.data());
      });
    }

    /* =========================
       3️⃣ MAP LOGS
    ========================== */
    const records: AttendanceLog[] = [];

    for (const docSnap of attSnap.docs) {
      const d = docSnap.data() as {
        uid: string;
        timestamp?: Timestamp;
        type?: "check-in" | "check-out";
        status?: AttendanceStatus;
      };

      let userData;

      if (role === "student") {
        // โหลด profile ตัวเองครั้งเดียว
        if (!userMap.has(uid)) {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            userMap.set(uid, userDoc.data());
          }
        }
        userData = userMap.get(uid);
      } else {
        userData = userMap.get(d.uid);
      }

      records.push({
        id: docSnap.id,
        uid: d.uid,

        studentId: userData?.id ?? "-",

        name: userData
          ? `${userData.prefix ?? ""} ${userData.name ?? ""}`.trim()
          : "Unknown",

        imgUrl: userData?.imgUrl ?? null,

        timestamp:
          d.timestamp instanceof Timestamp
            ? d.timestamp.toDate().toISOString()
            : "",

        type: d.type ?? "check-in",
        status: d.status ?? "absent",
      });
    }

    return records;
  } catch (err) {
    console.error("❌ fetchAttendanceFromFirebase failed:", err);
    return [];
  }
}
