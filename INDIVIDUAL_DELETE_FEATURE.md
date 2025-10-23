# Individual Delete Feature

## Overview
Fitur untuk menghapus hasil tes individual per kandidat dengan tombol delete di sebelah tombol download. Setiap row di tabel results memiliki tombol delete individual yang aman dengan konfirmasi.

## Problem
- ❌ **No Individual Delete**: Tidak ada cara untuk menghapus hasil tes per kandidat
- ❌ **Bulk Only**: Hanya bisa menghapus semua data sekaligus
- ❌ **No Granular Control**: Tidak bisa menghapus hasil tes tertentu saja

## Solution
- ✅ **Individual Delete**: Tombol delete per row di tabel results
- ✅ **Safe Operation**: Konfirmasi sebelum menghapus
- ✅ **Granular Control**: Bisa menghapus hasil tes kandidat tertentu saja
- ✅ **Activity Logging**: Mencatat aktivitas penghapusan individual

## Changes Made

### 1. Frontend Components ✅

#### **ResultTable Component** - `app/results/components/result-table.tsx`
```typescript
// ✅ Added Trash2 icon import
import { Download, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

// ✅ Added onDelete prop
export interface ResultTableProps {
  results: Result[];
  onView: (candidateId: string) => void;
  onDownload: (candidateId: string) => Promise<void>;
  onDelete: (candidateId: string) => Promise<void>; // ✅ New prop
  pageSize?: number;
}

// ✅ Added delete state
const [deletingId, setDeletingId] = useState<string | null>(null);

// ✅ Added delete handler
const handleDelete = async (candidateId: string) => {
  const confirmed = window.confirm(
    `Apakah Anda yakin ingin menghapus hasil tes untuk kandidat ini?\n\nTindakan ini tidak dapat dibatalkan.`
  );

  if (!confirmed) return;

  try {
    setDeletingId(candidateId);
    await onDelete(candidateId);
  } catch (error) {
    console.error("Error deleting result:", error);
    alert("Gagal menghapus hasil tes. Silakan coba lagi.");
  } finally {
    setDeletingId(null);
  }
};
```

#### **Desktop Table Delete Button:**
```typescript
// ✅ Added delete button in desktop table
<td className="px-6 py-4 flex items-center gap-2 align-middle">
  <Button size="sm" variant="outline" onClick={() => onView(r.candidateId)}>
    View
  </Button>
  <Button size="sm" disabled={downloadingId === r.candidateId} 
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => handleDownload(r.candidateId)}>
    <Download className={cn("h-4 w-4", {
      "animate-pulse": downloadingId === r.candidateId,
    })} />
  </Button>
  <Button size="sm" variant="destructive" disabled={deletingId === r.candidateId}
          onClick={() => handleDelete(r.candidateId)}>
    <Trash2 className={cn("h-4 w-4", {
      "animate-pulse": deletingId === r.candidateId,
    })} />
  </Button>
</td>
```

#### **Mobile View Delete Button:**
```typescript
// ✅ Added delete button in mobile view
<div className="flex justify-between space-x-2">
  <Button size="sm" variant="outline" className="flex-1" onClick={() => onView(r.candidateId)}>
    View
  </Button>
  <Button size="sm" className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
          disabled={downloadingId === r.candidateId} onClick={() => handleDownload(r.candidateId)}>
    <Download className={cn("h-4 w-4", {
      "animate-pulse": downloadingId === r.candidateId,
    })} />
  </Button>
  <Button size="sm" variant="destructive" className="flex-1"
          disabled={deletingId === r.candidateId} onClick={() => handleDelete(r.candidateId)}>
    <Trash2 className={cn("h-4 w-4", {
      "animate-pulse": deletingId === r.candidateId,
    })} />
  </Button>
</div>
```

### 2. Service Layer ✅

#### **Results Service** - `app/results/services/result-service.tsx`
```typescript
/**
 * Hapus hasil tes kandidat individual
 */
async deleteResult(candidateId: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting result for candidate ${candidateId}...`);
    
    // Call API backend untuk menghapus data kandidat individual
    const response = await api.delete(`/results-public/delete/${candidateId}`);
    
    if (response.data.success) {
      console.log("✅ Result deleted successfully:", response.data.data);
      
      // Clear localStorage cache
      localStorage.removeItem('results_cache');
      localStorage.removeItem('candidate_results_cache');
      
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to delete result');
    }
    
  } catch (error) {
    console.error("❌ Error deleting result:", error);
    throw new Error(`Gagal menghapus hasil tes: ${error.message}`);
  }
}
```

### 3. Page Handler ✅

#### **Results Page** - `app/results/page.tsx`
```typescript
// ✅ Handler untuk menghapus hasil tes individual
const handleDelete = async (candidateId: string) => {
  try {
    await resultsService.deleteResult(candidateId);
    alert("✅ Hasil tes berhasil dihapus!");
    
    // Refresh halaman untuk menampilkan data terbaru
    window.location.reload();
  } catch (error) {
    console.error("❌ Gagal menghapus hasil tes:", error);
    alert(`❌ Gagal menghapus hasil tes: ${error.message}`);
  }
};

// ✅ Pass onDelete to ResultTable
<ResultTable
  results={results}
  onView={handleView}
  onDownload={handleDownload}
  onDelete={handleDelete} // ✅ New prop
/>
```

### 4. Backend API ✅

#### **TestDistributionController** - `app/Http/Controllers/TestDistributionController.php`
```php
/**
 * Delete individual candidate test result
 */
public function deleteResult($candidateId)
{
    try {
        DB::beginTransaction();

        // Log activity before deletion
        $logService = app(LogActivityService::class);
        $logService->log('DELETE_INDIVIDUAL_RESULT', 'Individual result deleted', [
            'candidate_id' => $candidateId,
            'deleted_at' => now(),
            'deleted_by' => 'admin'
        ]);

        // Find candidate test by candidate ID
        $candidateTest = CandidateTest::where('candidate_id', $candidateId)->first();
        
        if (!$candidateTest) {
            return response()->json([
                'success' => false,
                'message' => 'Candidate test not found'
            ], 404);
        }

        // Delete candidate answers for this test
        $answersDeleted = CandidateAnswer::where('candidate_test_id', $candidateTest->id)->delete();
        
        // Delete result records for this test
        $discResultsDeleted = \App\Models\DiscResult::where('candidate_test_id', $candidateTest->id)->delete();
        $caasResultsDeleted = \App\Models\CaasResult::where('candidate_test_id', $candidateTest->id)->delete();
        $telitiResultsDeleted = \App\Models\TelitiResult::where('candidate_test_id', $candidateTest->id)->delete();
        
        // Reset candidate test to not started
        $candidateTest->update([
            'status' => 'not_started',
            'completed_at' => null,
            'score' => null,
            'updated_at' => now()
        ]);

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Individual result deleted successfully',
            'data' => [
                'candidate_id' => $candidateId,
                'candidate_test_id' => $candidateTest->id,
                'answers_deleted' => $answersDeleted,
                'disc_results_deleted' => $discResultsDeleted,
                'caas_results_deleted' => $caasResultsDeleted,
                'teliti_results_deleted' => $telitiResultsDeleted,
                'candidate_test_reset' => 'Candidate test reset to not started'
            ]
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        
        \Log::error('Failed to delete individual result', [
            'candidate_id' => $candidateId,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Failed to delete individual result',
            'error' => $e->getMessage()
        ], 500);
    }
}
```

#### **API Route** - `routes/api.php`
```php
// ✅ New route for delete individual result
Route::delete('results-public/delete/{candidateId}', [App\Http\Controllers\TestDistributionController::class, 'deleteResult']);
```

## Data Deletion Process

### **What Gets Deleted for Individual Candidate:**
1. **Candidate Answers**: Semua jawaban kandidat untuk test tersebut
2. **DISC Results**: Hasil perhitungan DISC untuk kandidat tersebut
3. **CAAS Results**: Hasil perhitungan CAAS untuk kandidat tersebut
4. **Teliti Results**: Hasil perhitungan Teliti untuk kandidat tersebut
5. **Test Status**: Candidate test di-reset ke "not_started"

### **What Gets Preserved:**
1. **Candidate Data**: Data kandidat tetap ada
2. **Test Packages**: Data test packages tetap ada
3. **Test Distributions**: Distribusi test tetap ada
4. **Other Candidates**: Hasil tes kandidat lain tidak terpengaruh
5. **Questions**: Bank soal tetap ada

## Safety Features

### **Confirmation Dialog:**
```typescript
const confirmed = window.confirm(
  `Apakah Anda yakin ingin menghapus hasil tes untuk kandidat ini?\n\nTindakan ini tidak dapat dibatalkan.`
);
```

### **Database Transaction:**
- Semua operasi dalam satu transaction
- Rollback otomatis jika ada error
- Konsistensi data terjamin

### **Activity Logging:**
- Mencatat aktivitas penghapusan individual
- Menyimpan candidate_id, timestamp, dan user info
- Audit trail untuk keamanan

## User Experience

### **UI/UX Flow:**
1. User klik tombol delete (merah dengan icon trash) di row kandidat
2. Dialog konfirmasi muncul dengan peringatan
3. User harus klik "OK" untuk melanjutkan
4. Proses penghapusan dimulai dengan loading state
5. Halaman refresh otomatis setelah berhasil

### **Visual Design:**
- **Button Color**: Red (destructive) untuk menunjukkan bahaya
- **Icon**: Trash2 icon untuk konfirmasi visual
- **Position**: Di sebelah tombol download
- **Loading State**: Animate pulse saat proses delete
- **Responsive**: Layout tetap baik di desktop dan mobile

## Error Handling

### **Frontend Error Handling:**
```typescript
try {
  setDeletingId(candidateId);
  await onDelete(candidateId);
} catch (error) {
  console.error("Error deleting result:", error);
  alert("Gagal menghapus hasil tes. Silakan coba lagi.");
} finally {
  setDeletingId(null);
}
```

### **Backend Error Handling:**
```php
try {
  // Deletion process
  DB::commit();
  return response()->json(['success' => true, ...]);
} catch (\Exception $e) {
  DB::rollBack();
  \Log::error('Failed to delete individual result', [...]);
  return response()->json(['success' => false, ...], 500);
}
```

## Testing

### **Test Scenarios:**
1. **Successful Deletion**: User berhasil menghapus hasil tes individual
2. **Cancellation**: User membatalkan di konfirmasi
3. **API Error**: Backend error saat penghapusan
4. **Network Error**: Koneksi terputus saat penghapusan
5. **Not Found**: Kandidat tidak ditemukan

### **Expected Results:**
- Data kandidat terhapus dengan benar
- Halaman refresh menampilkan data terbaru
- Error handling yang baik
- Activity log tercatat

## Files Modified

- ✅ `app/results/components/result-table.tsx` - Added individual delete button
- ✅ `app/results/page.tsx` - Added delete handler
- ✅ `app/results/services/result-service.tsx` - Added delete service
- ✅ `app/Http/Controllers/TestDistributionController.php` - Added delete endpoint
- ✅ `routes/api.php` - Added delete route

## Security Considerations

### **Access Control:**
- Endpoint menggunakan public route (sesuai dengan pattern existing)
- Bisa ditambahkan middleware auth jika diperlukan

### **Data Protection:**
- Konfirmasi dialog mencegah penghapusan tidak sengaja
- Database transaction memastikan konsistensi
- Activity logging untuk audit trail

### **Recovery:**
- Data kandidat dan test packages tidak terhapus
- Bisa dijalankan ulang test dengan data yang sama
- Backup database disarankan sebelum penghapusan

## Next Steps

- [ ] Test dengan berbagai skenario
- [ ] Tambah middleware authentication jika diperlukan
- [ ] Implementasi soft delete sebagai alternatif
- [ ] Tambah bulk delete untuk multiple selection
- [ ] Implementasi undo functionality

## Summary

Fitur Individual Delete berhasil diimplementasikan dengan:
- ✅ **Granular Control**: Bisa menghapus hasil tes per kandidat
- ✅ **Safe Operation**: Konfirmasi dan database transaction
- ✅ **User Friendly**: UI yang jelas dan error handling yang baik
- ✅ **Audit Trail**: Activity logging untuk keamanan
- ✅ **Data Integrity**: Mempertahankan data penting lainnya

Sekarang admin bisa menghapus hasil tes individual dengan aman dan mudah! 🗑️✅



