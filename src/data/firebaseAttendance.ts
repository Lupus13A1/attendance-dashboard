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
import { AttendanceRecord } from "@/types/attendance";

export async function fetchAttendanceFromFirebase(
  uid: string,
  role: string
): Promise<AttendanceRecord[]> {
  try {
    let attQuery;

    /* =========================
       1️⃣ BUILD QUERY BY ROLE
    ========================== */
    if (role === "student") {
      attQuery = query(
        collection(db, "attendanceLogs"),
        where("uid", "==", uid)
      );
    } else {
      // admin / teacher
      attQuery = collection(db, "attendanceLogs");
    }

    const attSnap = await getDocs(attQuery);

    /* =========================
       2️⃣ LOAD USERS (เฉพาะกรณีจำเป็น)
    ========================== */

    let userMap = new Map<string, any>();

    if (role !== "student") {
      // admin/teacher ต้องรู้ชื่อทุกคน
      const usersSnap = await getDocs(collection(db, "users"));
      usersSnap.forEach((doc) => {
        userMap.set(doc.id, doc.data());
      });
    }

    /* =========================
       3️⃣ MAP DATA
    ========================== */
    const records: AttendanceRecord[] = [];

    for (const docSnap of attSnap.docs) {
      const d = docSnap.data() as { uid: string; timestamp?: Timestamp; type?: string; status?: string };

      let userData;

      if (role === "student") {
        // student โหลด profile ตัวเองครั้งเดียว
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
        fullName: userData
          ? `${userData.prefix ?? ""} ${userData.name ?? ""}`
          : "Unknown",

        image: userData?.imgUrl ?? null,

        timestamp:
          d.timestamp instanceof Timestamp
            ? d.timestamp.toDate()
            : null,

        type: d.type ?? "check-in",
        status: (d.status as any) ?? "absent",
      });
    }

    return records;
  } catch (err) {
    console.error("❌ fetchAttendanceFromFirebase failed:", err);
    return [];
  }
}
