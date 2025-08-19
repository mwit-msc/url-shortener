import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-4">
            <Image
              src="/sc-logo.png"
              alt="mwit-sc logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <div className="text-sm text-muted-foreground">
              <p>พัฒนาโดย ฝ่ายเทคโนโลยีสารสนเทศ</p>
              <p>คณะกรรมการสภานักเรียนรุ่นที่ 33</p>
              <p>โรงเรียนมหิดลวิทยานุสรณ์</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 md:items-end">
            <div className="flex space-x-4 text-sm">
              <Link 
                href="/report" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                รายงานการละเมิด
              </Link>
              <Link 
                href="/tos" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ข้อกำหนดการใช้งาน
              </Link>
              <Link 
                href="/privacy" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                นโยบายความเป็นส่วนตัว
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              ติดต่อ: <a href="mailto:admin@mwit.link" className="hover:text-foreground transition-colors">admin@mwit.link</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}