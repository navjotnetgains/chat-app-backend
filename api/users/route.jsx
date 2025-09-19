import User from "@/models/user";
import connectMongo from "@/lib/mongodb";

export async function GET() {
  try {
    await connectMongo();

    const users = await User.find({}, "-password"); 

    return Response.json({ users }, { status: 200 });
  } catch (error) {
    return Response.json({ message: "Error fetching users", error: error.message }, { status: 500 });
  }
}