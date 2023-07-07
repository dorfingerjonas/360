'use strict';

function printNav() {
    images.forEach(i => {
        const navElm = document.createElement('span');
        navElm.textContent = i.name;

        navElm.className = 'nav-element';

        navElm.addEventListener('click', () => {
            openImage(i.path);
        });

        document.getElementById('nav-wrapper').appendChild(navElm);
    });
}

let camera,
    scene,
    view = document.getElementById('view'),
    renderer,
    onPointerDownPointerX,
    onPointerDownPointerY,
    onPointerDownLon,
    onPointerDownLat,
    fov = 70, // Field of View
    isUserInteracting = false,
    lon = 0,
    lat = 0,
    phi = 0,
    theta = 0,
    width = window.innerWidth / 2,
    height = window.innerHeight / 2,
    ratio = width / height;

printNav();

let texture;

function init() {
    camera = new THREE.PerspectiveCamera(fov, ratio, 1, 1000);
    scene = new THREE.Scene();
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(500, 60, 40), new THREE.MeshBasicMaterial({ map: texture }));
    mesh.scale.x = -1;
    scene.add(mesh);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    view.appendChild(renderer.domElement);
    view.addEventListener('mousedown', onDocumentMouseDown, false);
    view.addEventListener('mousewheel', onDocumentMouseWheel, false);
    view.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
    window.addEventListener('resize', onWindowResized, false);
    onWindowResized();
}

function onWindowResized() {
    width = window.innerWidth / 1.2;
    height = window.innerHeight / 1.3;
    renderer.setSize(width, height);
    ratio = width / height;
    camera.projectionMatrix.makePerspective(fov, ratio, 1, 1100);
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    isUserInteracting = true;
    view.addEventListener('mousemove', onDocumentMouseMove, false);
    view.addEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentMouseMove(event) {
    lon = (event.clientX - onPointerDownPointerX) * -0.175 + onPointerDownLon;
    lat = (event.clientY - onPointerDownPointerY) * -0.175 + onPointerDownLat;
}

function onDocumentMouseUp() {
    isUserInteracting = false;
    view.removeEventListener('mousemove', onDocumentMouseMove, false);
    view.removeEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentMouseWheel(event) {
    if (event.wheelDeltaY) {
        fov -= event.wheelDeltaY * 0.05;
    } else if (event.wheelDelta) {
        fov -= event.wheelDelta * 0.05;
    } else if (event.detail) {
        fov += event.detail * 1.0;
    }
    if (fov < 45 || fov > 90) {
        fov = (fov < 45) ? 45 : 90;
    }
    camera.projectionMatrix.makePerspective(fov, ratio, 1, 1100);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    if (!isUserInteracting) {
        lon += .05;
    }

    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);
    camera.position.x = 100 * Math.sin(phi) * Math.cos(theta);
    camera.position.y = 100 * Math.cos(phi);
    camera.position.z = 100 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

function openImage(path) {
    view.innerHTML = '';

    texture = THREE.ImageUtils.loadTexture(path, new THREE.UVMapping(), () => {
        init();
        animate();
    });
}
