import React, { useEffect, useRef } from "react";
import { db } from "../firebase";
import Chat from "./Chat";
import { useCollection } from "react-firebase-hooks/firestore";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { SearchIcon } from "@heroicons/react/outline";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import * as EmailValidator from "email-validator";
import { toast } from "react-toastify";
import Fade from "react-reveal/Fade";
import { useKeyPress } from "../hooks/useKeyPress";
import Link from "next/link";
import { useRouter } from "next/router";
import { SignedIn, UserButton } from "@clerk/clerk-react";
import useDarkMode from "../hooks/useDarkMode";

const Sidebar = () => {
  const user = window?.Clerk?.user;
  const [users, setUsers] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const router = useRouter();
  const [colorTheme, setTheme] = useDarkMode();

  const slashpress = useKeyPress("/");
  const escpress = useKeyPress("Escape");
  const inputFocusRef = useRef(null);

  useEffect(() => {
    slashpress && inputFocusRef?.current?.focus();
  }, [slashpress]);

  useEffect(() => {
    escpress && inputFocusRef?.current?.blur();
  }, [escpress]);

  useEffect(() => {
    setFilteredSuggestions(users);
  }, [users]);

  useEffect(() => {
    db.collection("users")
      .orderBy("name")
      .onSnapshot((snapshot) =>
        setUsers(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
        )
      );
  }, []);

  const userChatsRef = db
    .collection("chats")
    .where("users", "array-contains", user?.primaryEmailAddress?.emailAddress);
  const [chatsSnapshot] = useCollection(userChatsRef);

  const createChat = (input) => {
    if (!input) return;
    if (
      EmailValidator.validate(input) &&
      !chatAlreadyExist(input) &&
      input !== user?.primaryEmailAddress?.emailAddress
    ) {
      db.collection("chats").add({
        users: [user?.primaryEmailAddress?.emailAddress, input],
      });
    }
    setIsOpen(false);
  };

  const chatAlreadyExist = (recipientEmail) =>
    !!chatsSnapshot?.docs.find(
      (chat) =>
        chat.data().users.find((user) => user === recipientEmail)?.length > 0
    );

  const [isOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const onChange = (e) => {
    const userInput = e.currentTarget.value;
    const filteredSuggestions = users.filter(
      (user) =>
        user?.data?.name?.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );
    setFilteredSuggestions(filteredSuggestions.slice(0, 10));
    setInputValue(e.currentTarget.value);
  };

  const filterChats = (e) => {
    let sidebarChat = document.getElementsByClassName("sidebarChat");

    let inputValLowerCase = e.target.value.toLowerCase();

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    let inputValCaps = capitalizeFirstLetter(e.target.value);

    Array.from(sidebarChat).forEach((element) => {
      let NameHd =
        element.getElementsByClassName("recipientName")[0].textContent;

      if (
        NameHd?.includes(inputValLowerCase) ||
        NameHd?.includes(inputValCaps) ||
        NameHd?.includes(e.target.value.toUpperCase())
      ) {
        element.classList.add("flex");
        element.classList.remove("hidden");
      } else {
        element.classList.add("hidden");
        element.classList.remove("flex");
      }
    });
  };

  return (
    <div className="flex flex-row-reverse max-h-screen w-[450px] min-h-screen">
      <Fade left>
        <div className="max-h-screen bg-bgprimary w-[400px] min-h-screen text-white">
          <div className="pt-5 text-center ">
            <Link passHref href="/">
              <a>
                <Image
                  src="https://res.cloudinary.com/dssvrf9oz/image/upload/v1626881694/Aman-removebg-preview_pwjggi.png"
                  alt="chatCube"
                  width={100}
                  height={100}
                  objectFit="contain"
                  className="cursor-pointer"
                />
              </a>
            </Link>
          </div>
          <div className="flex items-center justify-center p-3 border-b-[1px] border-darkblue ">
            <div className="flex items-center justify-center p-3 text-black bg-white/10 backdrop-filter backdrop-blur-2xl rounded-xl w-80">
              <SearchIcon className="w-6 h-6 text-white dark:text-gray-50" />
              <input
                ref={inputFocusRef}
                className="flex-1 ml-3 text-white placeholder-white bg-transparent border-none outline-none"
                placeholder="Search in chats"
                type="text"
                onChange={filterChats}
              />
            </div>
          </div>
          <hr className="text-transparent bg-transparent" />
          <Transition appear show={isOpen} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm"
              onClose={closeModal}
            >
              <div className="min-h-screen px-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Overlay className="fixed inset-0" />
                </Transition.Child>

                <span
                  className="inline-block h-screen align-middle"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Start a chat with others
                    </Dialog.Title>
                    <input
                      ref={inputFocusRef}
                      className="w-full p-4 mt-3 placeholder-gray-300 rounded-md shadow-md outline-none focus-visible:ring-blue-500"
                      placeholder="Search for someone"
                      value={inputValue}
                      onChange={onChange}
                    />

                    <div className="h-full mt-2 overflow-y-scroll hidescrollbar">
                      {filteredSuggestions.map(
                        ({ id, data: { name, email, photoURL } }) => (
                          <div
                            key={id}
                            onClick={() => {
                              createChat(email);
                              toast.success("Chat created successfully");
                            }}
                          >
                            {email ===
                            user?.primaryEmailAddress?.emailAddress ? (
                              <div></div>
                            ) : (
                              <div className="flex items-center p-4 my-1 text-white break-words cursor-pointer rounded-xl">
                                <Image
                                  width={56}
                                  height={56}
                                  src={photoURL}
                                  alt={name}
                                  className="rounded-full cursor-pointer hover:opacity-80"
                                />
                                <div className="flex flex-col ml-3 break-words cursor-pointer">
                                  <p>{name}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-xl hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                        onClick={closeModal}
                      >
                        I will chat later!
                      </button>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>
          <div>
            <div className="px-3 pt-5">
              <p className="pb-5 text-sm font-thin tracking-widest uppercase">
                direct messages
              </p>
            </div>
            <div className="w-full">
              {chatsSnapshot?.docs.map((chat) => (
                <Chat key={chat.id} id={chat.id} users={chat.data().users} />
              ))}
            </div>
          </div>

          <div className="flex fixed w-[400px] bottom-0 flex-col justify-between mt-auto">
            <div className="w-full focus:outline-none border-b-[1px] py-2 px-8 border-darkblue">
              <button
                className="bg-[#1F1E5E] shadow-lg p-2 text-center font-semibold rounded-sm w-full"
                onClick={openModal}
              >
                Start a new chat
              </button>
            </div>
            <div className="p-4 border-t-[1px] border-indigo-500 flex pl-6 flex-row gap-4 items-center">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <h1 className="font-semibold">
                {user?.data?.first_name} {user?.data?.last_name}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse p-5">
          <div className="flex items-center justify-center w-8 h-8 duration-75 delay-75 cursor-pointer hover:w-9 hover:h-9">
            {colorTheme === "light" ? (
              <svg
                onClick={() => setTheme("light")}
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 text-gray-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            ) : (
              <svg
                onClick={() => setTheme("dark")}
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </div>
        </div>
      </Fade>
    </div>
  );
};

export default Sidebar;
