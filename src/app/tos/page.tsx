import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ScrollText, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าหลัก
            </Link>
          </Button>
          
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <ScrollText className="w-12 h-12 text-blue-500" />
              </div>
              <CardTitle className="text-3xl font-bold">ข้อกำหนดในการให้บริการ</CardTitle>
              <CardDescription>
                Terms of Service - MWIT URL Shortener
              </CardDescription>
              <p className="text-sm text-muted-foreground">
                อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <div className="space-y-8">
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. การยอมรับข้อกำหนด</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    การใช้บริการ MWIT URL Shortener ถือเป็นการยอมรับข้อกำหนดและเงื่อนไขการให้บริการนี้ทั้งหมด 
                    หากท่านไม่เห็นด้วยกับข้อกำหนดใดๆ กรุณาหยุดการใช้บริการทันที
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. คำจำกัดความ</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>&ldquo;บริการ&rdquo;</strong> หมายถึง บริการย่อ URL ที่จัดให้โดย MWIT URL Shortener</li>
                    <li><strong>&ldquo;ผู้ใช้&rdquo;</strong> หมายถึง บุคคลที่ใช้บริการของเรา</li>
                    <li><strong>&ldquo;ลิงก์สั้น&rdquo;</strong> หมายถึง URL ที่ถูกย่อผ่านบริการของเรา</li>
                    <li><strong>&ldquo;เนื้อหา&rdquo;</strong> หมายถึง ข้อมูล ข้อความ รูปภาพ หรือสื่อใดๆ ที่เชื่อมโยงผ่านลิงก์สั้น</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. การใช้บริการ</h2>
                  
                  <h3 className="text-xl font-medium mb-3">3.1 สิทธิ์ในการใช้งาน</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    เราให้สิทธิ์แก่ท่านในการใช้บริการสำหรับวัตถุประสงค์ที่ถูกต้องตามกฎหมายเท่านั้น
                  </p>

                  <h3 className="text-xl font-medium mb-3">3.2 ข้อจำกัดการใช้งาน</h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">ท่านตกลงที่จะไม่ใช้บริการเพื่อ:</p>
                  <ul className="space-y-1 text-muted-foreground ml-6">
                    <li>• เผยแพร่เนื้อหาที่ผิดกฎหมาย ลามก อนาจาร หรือไม่เหมาะสม</li>
                    <li>• แชร์มัลแวร์ ไวรัส หรือซอฟต์แวร์ที่เป็นอันตราย</li>
                    <li>• ละเมิดลิขสิทธิ์หรือทรัพย์สินทางปัญญาของผู้อื่น</li>
                    <li>• หลอกลวง ฉ้อโกง หรือชักนำให้เข้าใจผิด</li>
                    <li>• ส่งสแปมหรือโฆษณาที่ไม่พึงประสงค์</li>
                    <li>• รบกวนการทำงานของบริการหรือเซิร์ฟเวอร์</li>
                    <li>• เก็บรวบรวมข้อมูลผู้ใช้อื่นโดยไม่ได้รับอนุญาต</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. บัญชีผู้ใช้</h2>
                  
                  <h3 className="text-xl font-medium mb-3">4.1 การสร้างบัญชี</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    การสร้างบัญชีต้องใช้ข้อมูลที่ถูกต้องและเป็นปัจจุบัน ท่านมีหน้าที่รักษาความปลอดภัยของบัญชี
                  </p>

                  <h3 className="text-xl font-medium mb-3">4.2 ความรับผิดชอบ</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    ท่านรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของท่าน
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. เนื้อหาและความรับผิดชอบ</h2>
                  
                  <h3 className="text-xl font-medium mb-3">5.1 เนื้อหาของผู้ใช้</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    ท่านรับผิดชอบเต็มที่ต่อเนื้อหาที่เชื่อมโยงผ่านลิงก์สั้นของท่าน เราไม่ควบคุมหรือตรวจสอบเนื้อหาดังกล่าว
                  </p>

                  <h3 className="text-xl font-medium mb-3">5.2 การรายงานการละเมิด</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    เราสงวนสิทธิ์ในการลบหรือปิดการใช้งานลิงก์ที่ละเมิดข้อกำหนดนี้ ผู้ใช้สามารถรายงานเนื้อหาที่ไม่เหมาะสมได้
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. ความเป็นส่วนตัวและข้อมูล</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    การจัดเก็บและใช้ข้อมูลส่วนบุคคลจะเป็นไปตามนโยบายความเป็นส่วนตัวของเรา 
                    เราอาจจัดเก็บสถิติการคลิกและข้อมูลการใช้งานเพื่อปรับปรุงบริการ
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. การยกเลิกและระงับบริการ</h2>
                  
                  <h3 className="text-xl font-medium mb-3">7.1 การยกเลิกโดยผู้ใช้</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    ท่านสามารถยกเลิกการใช้บริการได้ตลอดเวลาโดยลบบัญชีของท่าน
                  </p>

                  <h3 className="text-xl font-medium mb-3">7.2 การระงับโดยเรา</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    เราสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีที่ละเมิดข้อกำหนดนี้โดยไม่ต้องแจ้งล่วงหน้า
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. การปฏิเสธความรับผิดชอบ</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    บริการให้บริการ &ldquo;ตามสภาพที่เป็น&rdquo; เราไม่รับประกันความพร้อมใช้งาน ความถูกต้อง หรือความปลอดภัยของบริการ 
                    เราไม่รับผิดชอบต่อความเสียหายใดๆ ที่อาจเกิดขึ้นจากการใช้บริการ
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. การเปลี่ยนแปลงข้อกำหนด</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    เราสงวนสิทธิ์ในการเปลี่ยนแปลงข้อกำหนดนี้ได้ตลอดเวลา การเปลี่ยนแปลงจะมีผลทันทีเมื่อเผยแพร่บนเว็บไซต์ 
                    การใช้บริการต่อไปถือเป็นการยอมรับข้อกำหนดใหม่
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. กฎหมายที่ใช้บังคับ</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    ข้อกำหนดนี้อยู่ภายใต้กฎหมายของประเทศไทย ข้อพิพาทใดๆ จะอยู่ในเขตอำนาจศาลไทย
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">11. การติดต่อ</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    หากมีคำถามเกี่ยวกับข้อกำหนดนี้ กรุณาติดต่อเราผ่านหน้าแดชบอร์ดหรือระบบรายงานการละเมิด
                  </p>
                </section>

                <div className="mt-12 p-6 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">ข้อมูลสำคัญ</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• บริการนี้ดำเนินการโดย คณะกรรมการสภานักเรียน โรงเรียนมหิดลวิทยานุสรณ์</li>
                    <li>• เป็นบริการสำหรับการศึกษาและใช้งานภายในองค์กร</li>
                    <li>• การใช้บริการต้องเป็นไปตามนโยบายของสถาบัน</li>
                    <li>• เราสงวนสิทธิ์ในการปรับปรุงและพัฒนาบริการตลอดเวลา</li>
                  </ul>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              หน้าหลัก
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              แดชบอร์ด
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/report">
              รายงานการละเมิด
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}