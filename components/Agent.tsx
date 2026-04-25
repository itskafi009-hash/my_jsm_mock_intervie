"use client";
import {useRef} from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getVapiInstance } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback, updateInterviewRole, detectRoleFromTranscript } from "@/lib/actions/general.actions";


enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "system" | "assistant";
    content: string;
}

const Agent = ({
                   userName,
                   userId,
                   interviewId,
                   feedbackId,
                   type,
                   questions,
               }: AgentProps) => {
    const router = useRouter();

    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastMessage, setLastMessage] = useState<string>("");
    const vapi = getVapiInstance()
    const hasRunRef = useRef(false);

// ✅ STEP 1: HANDLE FEEDBACK FUNCTION
    const handleGenerateFeedback = async (messages: SavedMessage[], role: string) => {
        console.log("handleGenerateFeedback 🚀");

        const { success, feedbackId: id } = await createFeedback({
            interviewId: interviewId!,
            userId: userId!,
            transcript: messages,
            feedbackId,
            role: role
        });

        console.log("FEEDBACK RESULT:", success, id);

        if (success && id) {
            router.push(`/interview/${interviewId}/feedback`);
        } else {
            console.log("❌ Error saving feedback");
            router.push("/");
        }
    };

// ✅ STEP 2: VAPI EVENTS
   /* useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE);
        };

        const onCallEnd = () => {
            console.log("CALL ENDED 🔴");
            setCallStatus(CallStatus.FINISHED);
        };

        const onMessage = (message: Message) => {
            console.log("VAPI MESSAGE:", message);

            /* if (message.type === "transcript") {
                 const newMessage = {
                     role: message.role,
                     content: message.transcript,
                 };

                 console.log("NEW MESSAGE:", newMessage);

                 setMessages((prev) => [...prev, newMessage]);
             }
            if (message.type === "transcript") {
                const text = message.transcript.toLowerCase();

                // ✅ ROLE DETECT
                if (text.includes("data science")) {
                    setDetectedRole("Data Science");
                } else if (text.includes("frontend")) {
                    setDetectedRole("Frontend Developer");
                } else if (text.includes("backend")) {
                    setDetectedRole("Backend Developer");
                } else if (text.includes("marketing")) {
                    setDetectedRole("Marketing Manager");
                }

                const newMessage = {
                    role: message.role,
                    content: message.transcript,
                };

                setMessages((prev) => [...prev, newMessage]);
            }
        };

        const onSpeechStart = () => {
            console.log("speech start");
            setIsSpeaking(true);
        };

        const onSpeechEnd = () => {
            console.log("speech end");
            setIsSpeaking(false);
        };

        const onError = (error: Error) => {
            console.log("Error:", error);
        };

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("error", onError);

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("error", onError);
        };
    }, []);*/
   /* const detectRoleFromAI = async (text: string) => {
        try {
            const result = await generateText({
                model: google("gemini-3-flash"),
                prompt: `
Extract only the job role from this text.

Rules:
- Return only role name
- No explanation
- If not clear, return "General Interview"

Text: ${text}
            `,
            });

            return result.text.trim();
        } catch (error) {
            return "General Interview";
        }
    };*/
    useEffect(() => {
        const vapi = getVapiInstance();

        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE);
        };

        const onCallEnd = () => {
            console.log("CALL ENDED 🔴");
            setCallStatus(CallStatus.FINISHED);
        };

        const onMessage = (message: any) => {
            console.log("VAPI MESSAGE:", message);

            if (message.type === "transcript" && message.transcriptType === "final") {
                const text = message.transcript.toLowerCase();



                const newMessage = {
                    role: message.role,
                    content: message.transcript,
                };

                setMessages((prev) => [...prev, newMessage]);
            }
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error: any) => console.log("Error:", error);

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("error", onError);

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("error", onError);
        };
    }, []);


// ✅ STEP 3: UPDATE LAST MESSAGE UI
    useEffect(() => {
        if (messages.length > 0) {
            setLastMessage(messages[messages.length - 1].content);
        }
    }, [messages]);

// ✅ STEP 4: GENERATE FEEDBACK AFTER CALL ENDS
    /*useEffect(() => {
        if (callStatus === CallStatus.FINISHED && messages.length > 0) {
            console.log("CALL FINISHED");
            console.log("FINAL MESSAGES:", messages);

            setTimeout(() => {
                handleGenerateFeedback(messages);
            }, 1500);
        }
    }, [callStatus, messages]);
// ✅ STEP 4: GENERATE FEEDBACK AFTER CALL ENDS
    useEffect(() => {
        // 🔴 ADD THIS CHECK HERE
        if (!interviewId) {
            console.log("❌ interviewId missing");
            return;
        }

        if (callStatus === CallStatus.FINISHED && messages.length > 0) {
            console.log("CALL FINISHED");
            console.log("FINAL MESSAGES:", messages);

            setTimeout(() => {
                handleGenerateFeedback(messages);
            }, 1500);
        }
    }, [callStatus, messages, interviewId]); // ✅ ADD interviewId here
    useEffect(() => {
        if (!interviewId) return;

        if (
            callStatus === CallStatus.FINISHED &&
            messages.length > 0
        ) {
            console.log("CALL FINISHED");

            const timeout = setTimeout(() => {
                handleGenerateFeedback(messages);
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [callStatus, messages, interviewId]);
    useEffect(() => {
        if (!interviewId) return;

        if (callStatus === CallStatus.FINISHED && messages.length > 0) {
            if (hasRunRef.current) return;
            hasRunRef.current = true;

            const timeout = setTimeout(async () => {

                // 🧠 STEP 1: combine full transcript
                const fullText = messages
                    .map((m) => m.content)
                    .join(". ");


                // 🧠 STEP 2: detect role from FULL conversation
                const timeout = setTimeout(async () => {

                    // ✅ CALL SERVER FUNCTION
                    const finalRole = await detectRoleFromTranscript(messages);

                    console.log("FINAL ROLE:", finalRole);

                    // ✅ SAVE ROLE
                    await updateInterviewRole(interviewId!, finalRole || "General Interview");

                    // ✅ GENERATE FEEDBACK
                    handleGenerateFeedback(messages);

                }, 1000);
                console.log("FINAL ROLE:", finalRole);

                // 🧠 SAVE ROLE ONCE
                await updateInterviewRole(interviewId!, finalRole || "General Interview");

                // 🧠 THEN GENERATE FEEDBACK
                handleGenerateFeedback(messages);

            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [callStatus, messages, interviewId]);*/

 /*// ✅ START CALL
    const handleCall = async () => {

        setCallStatus(CallStatus.CONNECTING);

        if (type === "generate") {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                },
            });
        } else {
            let formattedQuestions = "";
            if (questions) {
                formattedQuestions = questions
                    .map((question) => `- ${question}`)
                    .join("\n");
            }

            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions,
                },
            });
        }
    };*/
    useEffect(() => {
        if (!interviewId) return;

        if (callStatus === CallStatus.FINISHED && messages.length > 0) {
            if (hasRunRef.current) return;
            hasRunRef.current = true;

            const timeout = setTimeout(async () => {

                // ✅ STEP 1: detect role from SERVER
                console.log("MESSAGES SENT:", messages);
                const finalRole = await detectRoleFromTranscript(messages);

                console.log("FINAL ROLE:", finalRole);

                // ✅ STEP 2: save role
                await updateInterviewRole(
                    interviewId!,
                    finalRole || "General Interview"
                );

                // ✅ STEP 3: generate feedback
                handleGenerateFeedback(messages,finalRole);

            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [callStatus, messages, interviewId]);
    const handleCall = async () => {

        if (!vapi) return;
        hasRunRef.current = false;

        setCallStatus(CallStatus.CONNECTING);

        if (type === "generate") {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                },
            });
        } else {
            let formattedQuestions = "";

            if (questions) {
                formattedQuestions = questions.map(q => `- ${q}`).join("\n");
            }

            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions,
                },
            });
        }
    };

// ✅ END CALL
    const handleDisconnect = () => {
        const vapi =  getVapiInstance();
        console.log("MANUAL END CALL");
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    return (
        <>
            <div className="call-view">
                {/* AI Interviewer */}
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image
                            src="/ai-avatar.png"
                            alt="profile-image"
                            width={65}
                            height={54}
                            className="object-cover"
                        />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                {/* User */}
                <div className="card-border">
                    <div className="card-content">
                        <Image
                            src="/user-avatar.png"
                            alt="profile-image"
                            width={539}
                            height={539}
                            className="rounded-full object-cover size-[120px]"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {/* Transcript */}
            {messages.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p
                            key={lastMessage}
                            className={cn(
                                "transition-opacity duration-500 opacity-0",
                                "animate-fadeIn opacity-100"
                            )}
                        >
                            {lastMessage}
                        </p>
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div className="w-full flex justify-center">
                {callStatus !== "ACTIVE" ? (
                    <button className="relative btn-call" onClick={handleCall}>
                    <span
                        className={cn(
                            "absolute animate-ping rounded-full opacity-75",
                            callStatus !== "CONNECTING" && "hidden"
                        )}
                    />
                        <span className="relative">
                        {callStatus === "INACTIVE" || callStatus === "FINISHED"
                            ? "Call"
                            : "..."}
                    </span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleDisconnect}>
                        End
                    </button>
                )}
            </div>
        </>
    );

};

export default Agent;