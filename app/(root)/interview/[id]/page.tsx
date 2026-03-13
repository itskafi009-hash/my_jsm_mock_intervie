import {redirect} from "next/navigation";
import {getRandomInterviewCover} from "@/lib/utils";
import Image from "next/image"
import DisplayTechIcons from "@/components/DisplayTechIcons";
import Agent from "@/components/Agent";
import {getCurrentUser} from "@/lib/action/auth.action";
import {getInterviewById} from "@/lib/action/general.action";


const Page = async ({params}:{ params: Promise<{id: string}>}) => {
    const { id } = await params;
    const user=await getCurrentUser();
    const interview = await getInterviewById(id);


    if(!interview) redirect('/')
    return (
        <>
            <div className="flex flex-row gap-4 justify-between">
                <div className="flex flex-row gap-4 items-center max-sm:flex-col">
                    <div className="flex flex-row gap-4 items-center">
                        <Image src={getRandomInterviewCover()} alt="cover-image" width={40} height={40} className="rounded-full object-cover size-[40px]" />
                        <h3 className="capitalize">{interview.role}Interview</h3>
                    </div>
                    <DisplayTechIcons techStack={interview.techstack} />
                </div>
                <p className="bg-dark-200 px-4 px-2 rounded-lg h-fit capitalize">{interview.type}</p>
            </div>
            <Agent userName={user?.name || "User"}
                   userId={user?.id || ""}
                   interviewId={id}
                   type="interview"
                   questions={interview.questions}
             />


        </>
    )
}
export default Page
