import toast, { Toaster, ToastBar} from 'react-hot-toast';

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      containerStyle={{ top: 24, right: 24, zIndex: 99999 }}
    >
      {(t: import('react-hot-toast').Toast) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <>
              {icon}
              <span style={{ marginLeft: 8, color: '#ffffff' }}>{message}</span>
              <button
                onClick={() => toast.dismiss(t.id)}
                style={{ marginLeft: 16, color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Dismiss
              </button>
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  )
}