import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
    getFeedbackByInterviewId,
    getInterviewById,
} from "@/lib/actions/general.actions";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.actions";

const Feedback = async ({ params }: RouteParams) => {
    const { id } = await params;
    const user = await getCurrentUser();

    const interview = await getInterviewById(id);
    if (!interview) redirect("/");

    const feedback = await getFeedbackByInterviewId({
        interviewId: id,
        userId: user?.id!,
    });
    const getSafeDate = (dateValue: any) => {
        if (!dateValue) return null;

        // Firestore timestamp
        if (dateValue.seconds) {
            return new Date(dateValue.seconds * 1000);
        }

        // normal date/string
        const d = new Date(dateValue);
        return isNaN(d.getTime()) ? null : d;
    };

    const safeDate = getSafeDate(feedback?.createdAt);
    console.log("feedback Data:", feedback);
    console.log("Category Scores:", feedback?.categoryScores);

    return (
        <section className="section-feedback">
            <div className="flex flex-row justify-center">
                <h1 className="text-4xl font-semibold">
                    Feedback on the Interview -{" "}
                    <span className="capitalize">{interview.role}</span> Interview
                </h1>
            </div>

            <div className="flex flex-row justify-center ">
                <div className="flex flex-row gap-5">
                    {/* Overall Impression */}
                    <div className="flex flex-row gap-2 items-center">
                        <Image src="/star.svg" width={22} height={22} alt="star" />
                        <p>
                            Overall Impression:{" "}
                            <span className="text-primary-200 font-bold">
                {feedback?.totalScore}
              </span>
                            /100
                        </p>
                    </div>

                    {/* Date */}
                    <div className="flex flex-row gap-2">
                        <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
                        <p>
                            {safeDate
                                ? dayjs(safeDate).format("MMM D, YYYY h:mm A")
                                : "N/A"}
                        </p>

                    </div>
                </div>
            </div>

            <hr />

            <p>{feedback?.finalAssessment}</p>

            {/* Interview Breakdown */}
            <div className="flex flex-col gap-4">
                <h2>Breakdown of the Interview:</h2>
                {Object.entries(feedback?.categoryScores || {}).map(([key, category]: any,index:number) => (
                    <div key={index}>
                        <p className="font-bold">
                            {index + 1}. {category.name} ({category.score}/100)
                        </p>
                        <p>{category.comment}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                <h3>Strengths</h3>
                <ul>
                    {Array.isArray(feedback?.strengths) ? (
                        feedback?.strengths.map((strength: string, index: number) => (
                            <li key={index}>{strength}</li>
                        ))
                    ) : (
                        <li>{feedback?.strengths}</li>
                    )}


                </ul>
            </div>

            <div className="flex flex-col gap-3">
                <h3>Areas for Improvement</h3>
                <ul>
                    {Array.isArray(feedback?.areasForImprovement) ? (

                        feedback.areasForImprovement.map((area: string, index: number) => (
                            <li key={index}>{area}</li>
                        ))
                    ) :(
                        <li>{feedback?.areasForImprovement}</li>
                    )}

                </ul>
            </div>

            <div className="buttons">
                <Button className="btn-secondary flex-1">
                    <Link href="/" className="flex w-full justify-center">
                        <p className="text-sm font-semibold text-primary-200 text-center">
                            Back to dashboard
                        </p>
                    </Link>
                </Button>

                <Button className="btn-primary flex-1">
                    <Link
                        href={`/interview/${id}`}
                        className="flex w-full justify-center"
                    >
                        <p className="text-sm font-semibold text-black text-center">
                            Retake Interview
                        </p>
                    </Link>
                </Button>
            </div>
        </section>
    );
};

export default Feedback;
