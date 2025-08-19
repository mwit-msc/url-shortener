import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Shield, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicy() {
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
                <Shield className="w-12 h-12 text-green-500" />
              </div>
              <CardTitle className="text-3xl font-bold">นโยบายความเป็นส่วนตัว</CardTitle>
              <CardDescription>
                Privacy Policy - MWIT URL Shortener
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
                  <h2 className="text-2xl font-semibold mb-4">1. บทนำ</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    MWIT URL Shortener ให้ความสำคัญกับความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลของท่าน 
                    นโยบายนี้อธิบายวิธีการที่เราจัดเก็บ ใช้ และคุ้มครองข้อมูลของท่าน
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. ข้อมูลที่เราจัดเก็บ</h2>
                  
                  <h3 className="text-xl font-medium mb-3">2.1 ข้อมูลบัญชีผู้ใช้</h3>
                  <ul className="space-y-1 text-muted-foreground ml-6">
                    <li>• ชื่อและอีเมลจากการลงทะเบียนผ่าน OAuth</li>
                    <li>• รูปโปรไฟล์ (หากมี)</li>
                    <li>• วันที่สร้างบัญชีและการเข้าใช้งานครั้งล่าสุด</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3 mt-6">2.2 ข้อมูลการใช้งาน</h3>
                  <ul className="space-y-1 text-muted-foreground ml-6">
                    <li>• URL ต้นทางที่ท่านย่อ</li>
                    <li>• ลิงก์สั้นที่สร้างขึ้น</li>
                    <li>• ชื่อเรื่องและคำอธิบายของลิงก์</li>
                    <li>• วันที่และเวลาในการสร้างลิงก์</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3 mt-6">2.3 ข้อมูลการวิเคราะห์</h3>
                  <ul className="space-y-1 text-muted-foreground ml-6">
                    <li>• ที่อยู่ IP (เก็บในรูปแบบ Hash เพื่อความเป็นส่วนตัว)</li>
                    <li>• User Agent ของเบราว์เซอร์</li>
                    <li>• เว็บไซต์อ้างอิง (Referer)</li>
                    <li>• เวลาที่คลิกลิงก์</li>
                    <li>• ข้อมูลทางภูมิศาสตร์โดยประมาณ (ระดับประเทศ/เมือง)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. วัตถุประสงค์ในการใช้ข้อมูล</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>3.1 การให้บริการ:</strong> เพื่อให้บริการย่อ URL และจัดการบัญชีผู้ใช้</li>
                    <li><strong>3.2 การวิเคราะห์:</strong> เพื่อให้สถิติการใช้งานและปรับปรุงบริการ</li>
                    <li><strong>3.3 ความปลอดภัย:</strong> เพื่อตรวจจับและป้องกันการใช้งานที่ไม่เหมาะสม</li>
                    <li><strong>3.4 การสื่อสาร:</strong> เพื่อแจ้งข่าวสารสำคัญเกี่ยวกับบริการ</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. การคุ้มครองข้อมูล</h2>
                  
                  <h3 className="text-xl font-medium mb-3">4.1 การเข้ารหัส</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    ข้อมูลทั้งหมดถูกเข้ารหัสในระหว่างการส่งผ่าน (HTTPS) และจัดเก็บในฐานข้อมูลที่มีความปลอดภัย
                  </p>

                  <h3 className="text-xl font-medium mb-3">4.2 การ Hash ที่อยู่ IP</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    ที่อยู่ IP ถูกแปลงเป็น Hash ด้วย SHA-256 เพื่อป้องกันการระบุตัวตนย้อนกลับ
                  </p>

                  <h3 className="text-xl font-medium mb-3">4.3 การจำกัดการเข้าถึง</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    เฉพาะผู้ดูแลระบบที่ได้รับอนุญาตเท่านั้นที่สามารถเข้าถึงข้อมูลส่วนบุคคล
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. การแชร์ข้อมูล</h2>
                  
                  <h3 className="text-xl font-medium mb-3">5.1 หลักการทั่วไป</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    เราไม่ขาย เช่า หรือแชร์ข้อมูลส่วนบุคคลของท่านกับบุคคลที่สาม ยกเว้นกรณีต่อไปนี้:
                  </p>

                  <h3 className="text-xl font-medium mb-3">5.2 กรณีพิเศษ</h3>
                  <ul className="space-y-1 text-muted-foreground ml-6">
                    <li>• เมื่อได้รับความยินยอมจากท่าน</li>
                    <li>• เพื่อปฏิบัติตามกฎหมายหรือคำสั่งศาล</li>
                    <li>• เพื่อป้องกันอันตรายต่อความปลอดภัยของผู้ใช้หรือสาธารณะ</li>
                    <li>• กับผู้ให้บริการที่จำเป็นต่อการดำเนินงาน (ภายใต้ข้อตกลงความลับ)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. สิทธิ์ของผู้ใช้</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>6.1 สิทธิ์ในการเข้าถึง:</strong> ท่านสามารถขอดูข้อมูลส่วนบุคคลที่เราจัดเก็บ</li>
                    <li><strong>6.2 สิทธิ์ในการแก้ไข:</strong> ท่านสามารถขอแก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                    <li><strong>6.3 สิทธิ์ในการลบ:</strong> ท่านสามารถขอลบข้อมูลส่วนบุคคล</li>
                    <li><strong>6.4 สิทธิ์ในการคัดค้าน:</strong> ท่านสามารถคัดค้านการประมวลผลข้อมูล</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Cookies และเทคโนโลยีติดตาม</h2>
                  
                  <h3 className="text-xl font-medium mb-3">7.1 การใช้ Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    เราใช้ Cookies เพื่อจดจำการลงชื่อเข้าใช้และปรับแต่งประสบการณ์การใช้งาน
                  </p>

                  <h3 className="text-xl font-medium mb-3">7.2 การควบคุม Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    ท่านสามารถจัดการการตั้งค่า Cookies ผ่านเบราว์เซอร์ของท่าน
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. การเก็บรักษาข้อมูล</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>ข้อมูลบัญชี:</strong> เก็บรักษาตลอดระยะเวลาที่บัญชียังใช้งาน</li>
                    <li><strong>ข้อมูลลิงก์:</strong> เก็บรักษาตามที่ผู้ใช้กำหนดหรือไม่เกิน 5 ปี</li>
                    <li><strong>ข้อมูลการวิเคราะห์:</strong> เก็บรักษาไม่เกิน 2 ปี</li>
                    <li><strong>ล็อกระบบ:</strong> เก็บรักษาไม่เกิน 1 ปี</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. การรายงานการละเมิด</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    เมื่อท่านรายงานลิงก์ที่ไม่เหมาะสม เราอาจจัดเก็บข้อมูลการรายงาน (อีเมลผู้รายงาน คำอธิบาย) 
                    เพื่อการตรวจสอบและติดตามผล ข้อมูลนี้จะถูกเก็บรักษาอย่างปลอดภัยและใช้เฉพาะการดำเนินการที่จำเป็น
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. การเปลี่ยนแปลงนโยบาย</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    เราสงวนสิทธิ์ในการเปลี่ยนแปลงนโยบายนี้ การเปลี่ยนแปลงสำคัญจะแจ้งให้ทราบล่วงหน้า 
                    ผ่านอีเมลหรือประกาศบนเว็บไซต์
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">11. การติดต่อ</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวหรือต้องการใช้สิทธิ์ของท่าน 
                    กรุณาติดต่อผ่านระบบรายงานหรือหน้าแดชบอร์ด
                  </p>
                </section>

                <div className="mt-12 p-6 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">สรุปสำคัญ</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">สิ่งที่เราทำ</h4>
                      <ul className="space-y-1">
                        <li>✓ เข้ารหัสข้อมูลทั้งหมด</li>
                        <li>✓ Hash ที่อยู่ IP เพื่อความเป็นส่วนตัว</li>
                        <li>✓ จำกัดการเข้าถึงข้อมูล</li>
                        <li>✓ ให้สิทธิ์ผู้ใช้ควบคุมข้อมูล</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">สิ่งที่เราไม่ทำ</h4>
                      <ul className="space-y-1">
                        <li>✗ ไม่ขายข้อมูลให้บุคคลที่สาม</li>
                        <li>✗ ไม่ติดตามการใช้งานนอกเว็บไซต์</li>
                        <li>✗ ไม่เก็บข้อมูลที่ไม่จำเป็น</li>
                        <li>✗ ไม่แชร์ข้อมูลโดยไม่ได้รับอนุญาต</li>
                      </ul>
                    </div>
                  </div>
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
            <Link href="/tos">
              ข้อกำหนดการใช้งาน
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              แดชบอร์ด
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}