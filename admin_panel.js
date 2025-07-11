// Elementos del DOM
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const activityForm = document.getElementById('activityForm');
const activitiesList = document.getElementById('activitiesList');
const noActivitiesMessage = document.getElementById('noActivitiesMessage');
const submitButton = document.getElementById('submitButton');

let activities = [];
let editingActivityId = null;

// Supabase config
const SUPABASE_URL = 'https://qnnhtuistcezjagsqzyj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFubmh0dWlzdGNlemphZ3NxenlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTkxNzQsImV4cCI6MjA2NzczNTE3NH0.NSlKBigrZzqAYEQfBIHAAiNY9jgSpL2mjbOnUTfpemc';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLE_NAME = 'activities';

// Función para renderizar actividades desde Supabase
const renderActivities = async () => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('created_at', { ascending: false });

        console.log('Datos de actividades recibidos:', data);
        console.log('Error al cargar actividades (si existe):', error);

        if (error) throw error;

        activities = data || [];
        activitiesList.innerHTML = '';

        if (activities.length === 0) {
            noActivitiesMessage.classList.remove('d-none');
        } else {
            noActivitiesMessage.classList.add('d-none');
            activities.forEach(activity => {
                const activityItem = document.createElement('div');
                activityItem.classList.add('list-group-item', 'activity-list-item');
                activityItem.innerHTML = `
                    <div class="activity-info">
                        <h5>${activity.titulo}</h5>
                        <small>${activity.fecha} - ${activity.ubicacion}</small>
                        <p>${activity.descripcion}</p>
                        <small>Imagen: <img src="${activity.imagenUrl}" alt="${activity.titulo}" style="max-width: 50px; max-height: 50px;"></small>
                    </div>
                    <div class="activity-actions">
                        <button class="btn btn-sm btn-warning edit-btn" data-id="${activity.id}">Editar</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${activity.id}">Eliminar</button>
                    </div>
                `;
                activitiesList.appendChild(activityItem);
            });
        }
    } catch (error) {
        console.error('Error al cargar actividades:', error.message);
        noActivitiesMessage.classList.remove('d-none');
        noActivitiesMessage.textContent = 'Error al cargar actividades. Inténtalo más tarde.';
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las actividades. Inténtalo de nuevo más tarde.',
            confirmButtonColor: '#1b396a',
        });
    }
};

// Guardar nueva actividad en Supabase
const saveActivityToSupabase = async (activity) => {
    try {
        console.log('Datos de actividad a guardar:', activity);
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([activity]);

        if (error) throw error;

        console.log('Actividad añadida:', data);
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'La actividad ha sido añadida correctamente.',
            confirmButtonColor: '#1b396a',
        });
        renderActivities();
    } catch (error) {
        console.error('Error al guardar actividad:', error.message);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar la actividad. Inténtalo de nuevo.',
            confirmButtonColor: '#1b396a',
        });
    }
};

// Editar actividad
const editActivityInSupabase = async (activityId, updatedActivity) => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updatedActivity)
            .eq('id', activityId);

        if (error) throw error;

        console.log('Actividad actualizada:', data);
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'La actividad ha sido actualizada correctamente.',
            confirmButtonColor: '#1b396a',
        });
        renderActivities();
    } catch (error) {
        console.error('Error al editar actividad:', error.message);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la actividad. Inténtalo de nuevo.',
            confirmButtonColor: '#1b396a',
        });
    }
};

// Eliminar actividad
const deleteActivityFromSupabase = async (activityId) => {
    try {
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', activityId);

        if (error) throw error;

        console.log('Actividad eliminada');
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'La actividad ha sido eliminada correctamente.',
            confirmButtonColor: '#1b396a',
        });
        renderActivities();
    } catch (error) {
        console.error('Error al eliminar actividad:', error.message);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar la actividad. Inténtalo de nuevo.',
            confirmButtonColor: '#1b396a',
        });
    }
};

// Evento submit del formulario
activityForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('activityTitle').value;
    const description = document.getElementById('activityDescription').value;
    const date = document.getElementById('activityDate').value;
    const location = document.getElementById('activityLocation').value;
    const imageFile = document.getElementById('activityImage').files[0];

    if (title && description && date && location) {
        const processActivity = (imageUrl) => {
            const activityData = {
                titulo: title,
                descripcion: description,
                fecha: date,
                ubicacion: location,
                imagenUrl: imageUrl || ''
            };

            if (editingActivityId) {
                editActivityInSupabase(editingActivityId, activityData);
            } else {
                saveActivityToSupabase(activityData);
            }

            activityForm.reset();
            editingActivityId = null;
            if (submitButton) submitButton.textContent = 'Añadir Actividad';
        };

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => processActivity(event.target.result);
            reader.readAsDataURL(imageFile);
        } else {
            if (editingActivityId) {
                const originalActivity = activities.find(a => a.id === editingActivityId);
                processActivity(originalActivity ? originalActivity.imagenUrl : '');
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Atención',
                    text: 'Selecciona una imagen para la nueva actividad.',
                    confirmButtonColor: '#1b396a',
                });
            }
        }
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Por favor, completa todos los campos.',
            confirmButtonColor: '#1b396a',
        });
    }
});

// Eventos de botones Editar y Eliminar
activitiesList.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains('delete-btn')) {
        Swal.fire({
            icon: 'question',
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará la actividad permanentemente.',
            showCancelButton: true,
            confirmButtonColor: '#1b396a',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                deleteActivityFromSupabase(id);
            }
        });
    } else if (e.target.classList.contains('edit-btn')) {
        const activity = activities.find(act => act.id == id);
        if (activity) {
            document.getElementById('activityTitle').value = activity.titulo;
            document.getElementById('activityDescription').value = activity.descripcion;
            document.getElementById('activityDate').value = activity.fecha;
            document.getElementById('activityLocation').value = activity.ubicacion;

            editingActivityId = activity.id;
            if (submitButton) submitButton.textContent = 'Guardar Cambios';
        }
    }
});

// Inicializar renderizado
renderActivities();