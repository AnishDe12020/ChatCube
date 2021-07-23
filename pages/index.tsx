import Head from "next/head";
import { useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { db } from "../firebase";
import firebase from "firebase";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (window.Clerk?.user) {
      db.collection("users")
        .doc(window.Clerk.user.primaryEmailAddress.emailAddress)
        .set(
          {
            email: window.Clerk.user.primaryEmailAddress.emailAddress,
            name: window.Clerk.user.fullName,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
            photoURL: window.Clerk.user.profileImageUrl,
            userName: window.Clerk.user.username,
          },
          { merge: true }
        );
    }
    router.prefetch("/chat/[id]");
  });

  return (
    <div className="flex flex-col">
      <Head>
        <title>ChatCube</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/icon.png" />
      </Head>
      <Header />
      <Sidebar />
    </div>
  );
}
