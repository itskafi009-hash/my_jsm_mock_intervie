'use client'
import {useEffect,useRef} from "react";
import Vapi from "@vapi-ai/web"
import React, { useState } from 'react'
import Image from "next/image"
import {cn} from "@/lib/utils";


enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface AgentProps{
    userName: string;
    userId: string;
    type: string;
}

const Agent = ({ userName, userId, type }: AgentProps) => {

    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const isSpeaking = true;
    const message = [
        'What is your name?',
        'My name is Aarya, nice to meet you!'
        ];

    const lastMessage = message[message.length-1];
    const handleCall = async () => {

        if (callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED) {
            setCallStatus(CallStatus.CONNECTING);

            // simulate connecting
            setTimeout(() => {
                setCallStatus(CallStatus.ACTIVE);
            }, 2000);
        } else {
            setCallStatus(CallStatus.FINISHED);
        }
    };

    return (
        <>
            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image
                            src="/ai-avatar.png"
                            alt="vapi"
                            width={65}
                            height={54}
                            className="object-cover"
                        />
                        {isSpeaking && <span className="animate-speak" />}
                    </div>
                    <h3>AI Interview</h3>
                </div>

                <div className="card-border">
                    <div className="card-content">
                        <Image
                            src="/user-avatar.png"
                            alt="user avatar"
                            width={120}
                            height={120}
                            className="rounded-full object-cover"
                        />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>
            {message.length > 0 && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p key = {lastMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                            {lastMessage}
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex justify-center mt-6">

                {callStatus !== CallStatus.ACTIVE ? (
                    <button onClick={handleCall} className="btn-call">
                        <span>
                            {(callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED)
                                ? 'Call'
                                : '. . .'}
                        </span>
                    </button>

                ) : (
                    <button onClick={handleCall} className="btn-disconnect">
                        End
                    </button>
                )}

            </div>
        </>
    )
}

export default Agent