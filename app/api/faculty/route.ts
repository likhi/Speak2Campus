import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, allAsync, runAsync, getAsync } from '@/lib/sqlite';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department'); // MCA, MBA, or MCOM

    const database = getDatabase();

    let sql = `
      SELECT f.*, d.name as dept_name
      FROM faculty f 
      LEFT JOIN departments d ON f.department_id = d.id
    `;
    let params: any[] = [];

    if (department) {
      sql += ` WHERE d.name = ?`;
      params.push(department.toUpperCase());
    }

    sql += ` ORDER BY f.name`;

    const stmt = database.prepare(sql);
    const faculty = stmt.all(...params);

    // Transform faculty data to include department name
    const transformedFaculty = faculty.map((f: any) => ({
      id: f.id,
      name: f.name,
      designation: f.designation,
      department_id: f.department_id,
      department: f.dept_name || '',
      profile_photo: f.profile_photo || null,
      specialization: f.specialization,
      experience: f.experience,
      email: f.email,
      cabin: f.cabin,
      created_at: f.created_at,
      updated_at: f.updated_at
    }));

    console.log('[v0] Fetched faculty:', transformedFaculty.length, 'records');
    return NextResponse.json(transformedFaculty || []);
  } catch (error) {
    console.error('[v0] Error fetching faculty:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch faculty: ${errorMsg}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let name: any = null;
    let designation: any = null;
    let department_id: any = null;
    let specialization: any = '';
    let experience: any = '';
    let email: any = '';
    let cabin: any = '';
    let profilePhotoPath: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name') as string | null;
      designation = formData.get('designation') as string | null;
      department_id = formData.get('department_id') as string | null;
      specialization = (formData.get('specialization') as string) || '';
      experience = (formData.get('experience') as string) || '';
      email = (formData.get('email') as string) || '';
      cabin = (formData.get('cabin') as string) || '';

      const file = formData.get('profile_photo') as File | null;
      if (file && (file as any).size > 0) {
        // Validate file type and size (2MB)
        const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
        const ftype = (file as any).type as string;
        const fsize = (file as any).size as number;

        if (!allowed.includes(ftype)) {
          return NextResponse.json({ error: 'Only JPG, JPEG and PNG images are allowed' }, { status: 400 });
        }
        if (fsize > 2 * 1024 * 1024) {
          return NextResponse.json({ error: 'File size must be <= 2MB' }, { status: 400 });
        }

        // Save file to public/uploads/faculty
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'faculty');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        const ext = ftype === 'image/png' ? 'png' : 'jpg';
        const fileName = `faculty-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);
        const arrayBuffer = await (file as any).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);
        profilePhotoPath = `/uploads/faculty/${fileName}`;
      }

    } else {
      const body = await request.json();
      name = body.name;
      designation = body.designation;
      department_id = body.department_id;
      specialization = body.specialization || '';
      experience = body.experience || '';
      email = body.email || '';
      cabin = body.cabin || '';
    }

    console.log('[v0] Adding faculty:', { name, designation, department_id });

    if (!name || !designation || !department_id) {
      return NextResponse.json(
        { error: 'Name, designation, and department_id are required' },
        { status: 400 }
      );
    }

    const database = getDatabase();
    const stmt = database.prepare(
      `INSERT INTO faculty (name, designation, department_id, profile_photo, specialization, experience, email, cabin) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`
    );

    const newFaculty = stmt.get([
      name,
      designation,
      department_id,
      profilePhotoPath,
      specialization || '',
      experience || '',
      email || '',
      cabin || ''
    ]) as { id: number; name: string; designation: string; department_id: number; profile_photo: string | null; specialization: string; experience: string; email: string; cabin: string } | undefined;

    if (!newFaculty) {
      throw new Error('Failed to insert faculty');
    }

    // Get department name
    const deptStmt = database.prepare('SELECT name FROM departments WHERE id = ?');
    const dept = deptStmt.get([department_id]) as { name: string } | undefined;

    const transformedFaculty = {
      id: newFaculty!.id,
      name: newFaculty!.name,
      designation: newFaculty!.designation,
      department_id: newFaculty!.department_id,
      department: dept?.name || '',
      profile_photo: newFaculty!.profile_photo || null,
      specialization: newFaculty!.specialization,
      experience: newFaculty!.experience,
      email: newFaculty!.email,
      cabin: newFaculty!.cabin
    };

    console.log('[v0] Faculty added successfully:', newFaculty!.id);
    return NextResponse.json(transformedFaculty, { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating faculty:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[v0] Full error details:', error);
    return NextResponse.json(
      { error: `Failed to create faculty: ${errorMsg}` },
      { status: 500 }
    );
  }
}


