import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href="/login">
        <button>Login</button>
      </Link>
      <br></br>
      <Link href="/signup">
        <button>Signup</button>
      </Link>
      <br></br>
      <Link href="/admin/category">
        <button>Category</button>
      </Link>
    </div>
  );
}